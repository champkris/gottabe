<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with(['merchant', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($orders);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        // Check if user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->load(['merchant', 'items.product']);

        return response()->json($order);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string',
            'shipping_address.email' => 'required|email',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'shipping_address.zip' => 'required|string',
            'shipping_address.country' => 'required|string',
            'payment_method' => 'required|string|in:card,cod',
            'notes' => 'nullable|string',
            'subtotal' => 'required|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Get all products with their merchants
            $productIds = collect($validated['items'])->pluck('product_id');
            $products = Product::with('merchant')
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            if ($products->count() !== $productIds->count()) {
                return response()->json([
                    'message' => 'Some products are invalid or not available',
                ], 400);
            }

            // Verify merchant approval
            foreach ($products as $product) {
                if (!$product->merchant->is_approved) {
                    return response()->json([
                        'message' => "Product {$product->name} is from an unapproved merchant",
                    ], 400);
                }
            }

            // Group items by merchant
            $itemsByMerchant = collect($validated['items'])->groupBy(function ($item) use ($products) {
                return $products[$item['product_id']]->merchant_id;
            });

            $createdOrders = [];

            // Create separate orders for each merchant
            foreach ($itemsByMerchant as $merchantId => $merchantItems) {
                $merchant = $products[$merchantItems[0]['product_id']]->merchant;

                // Calculate totals for this merchant's items
                $subtotal = 0;
                $orderItems = [];
                $totalQuantity = 0;

                foreach ($merchantItems as $item) {
                    $product = $products[$item['product_id']];

                    // Check stock
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->name}");
                    }

                    $price = $product->sale_price ?? $product->price;
                    $itemSubtotal = $price * $item['quantity'];
                    $subtotal += $itemSubtotal;
                    $totalQuantity += $item['quantity'];

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                        'price' => $price,
                        'quantity' => $item['quantity'],
                        'subtotal' => $itemSubtotal,
                    ];
                }

                // Calculate shipping and tax for this merchant's order
                $merchantItemCount = count($merchantItems);
                $totalItemCount = count($validated['items']);
                $shipping = ($validated['shipping_fee'] / $totalItemCount) * $merchantItemCount;
                $tax = ($validated['tax'] / $totalItemCount) * $merchantItemCount;
                $total = $subtotal + $shipping + $tax;

                // Calculate commission (fixed THB amount per piece sold)
                $commissionAmount = $merchant->commission_amount * $totalQuantity;
                $merchantPayout = $total - $commissionAmount;

                // Convert shipping address array to JSON string
                $shippingAddressJson = json_encode($validated['shipping_address']);

                // Create order for this merchant
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'merchant_id' => $merchantId,
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping' => $shipping,
                    'total' => $total,
                    'commission_amount_per_order' => $commissionAmount,
                    'commission_amount' => $commissionAmount,
                    'merchant_payout' => $merchantPayout,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                    'shipping_address' => $shippingAddressJson,
                    'billing_address' => $shippingAddressJson,
                    'shipping_method' => 'standard',
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Create order items
                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }

                // Update product stock and sales count
                foreach ($merchantItems as $item) {
                    $product = $products[$item['product_id']];
                    $product->decrement('stock', $item['quantity']);
                    $product->increment('total_sales', $item['quantity']);
                }

                // Update merchant sales count
                $merchant->increment('total_sales');

                // Load relationships for response
                $order->load(['merchant', 'items.product']);
                $createdOrders[] = $order;
            }

            DB::commit();

            // TODO: Send order confirmation email
            // TODO: Process payment

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $createdOrders[0], // Return first order for redirect
                'orders' => $createdOrders,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an order.
     */
    public function cancel(Order $order): JsonResponse
    {
        // Check if user owns this order
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'Order cannot be cancelled',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Update order status
            $order->updateStatus('cancelled');

            // Restore product stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
                $item->product->decrement('total_sales', $item->quantity);
            }

            // Update merchant sales count
            $order->merchant->decrement('total_sales');

            DB::commit();

            return response()->json([
                'message' => 'Order cancelled successfully',
                'order' => $order->fresh(['merchant', 'items.product']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}