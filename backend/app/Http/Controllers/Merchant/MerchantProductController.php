<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MerchantProductController extends Controller
{
    /**
     * Display a listing of merchant's products.
     */
    public function index(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant) {
            return response()->json(['message' => 'Merchant profile not found'], 404);
        }

        $query = $merchant->products()->with('category');

        // Filter by status
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by stock
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'in_stock':
                    $query->where('stock', '>', 0);
                    break;
                case 'low_stock':
                    $query->whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0);
                    break;
                case 'out_of_stock':
                    $query->where('stock', 0);
                    break;
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant || !$merchant->is_approved) {
            return response()->json(['message' => 'Merchant not approved'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'barcode' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string', // URLs or base64
            'attributes' => 'nullable|array',
            'tags' => 'nullable|array',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_digital' => 'boolean',
            'is_active' => 'boolean',
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date|after_or_equal:available_from',
        ]);

        $validated['merchant_id'] = $merchant->id;

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load('category'),
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        $merchant = request()->user()->merchant;

        // Verify product belongs to merchant
        if ($product->merchant_id !== $merchant->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->load(['category', 'reviews' => function ($query) {
            $query->with('user')->latest()->limit(10);
        }]);

        return response()->json($product);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $merchant = $request->user()->merchant;

        // Verify product belongs to merchant
        if ($product->merchant_id !== $merchant->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string',
            'stock' => 'sometimes|integer|min:0',
            'min_stock' => 'sometimes|integer|min:0',
            'images' => 'nullable|array',
            'attributes' => 'nullable|array',
            'tags' => 'nullable|array',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|array',
            'is_featured' => 'sometimes|boolean',
            'is_digital' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date|after_or_equal:available_from',
        ]);

        // Validate sale price is less than regular price
        if (isset($validated['sale_price']) && isset($validated['price'])) {
            if ($validated['sale_price'] >= $validated['price']) {
                return response()->json([
                    'message' => 'Sale price must be less than regular price',
                ], 422);
            }
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh('category'),
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $merchant = request()->user()->merchant;

        // Verify product belongs to merchant
        if ($product->merchant_id !== $merchant->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Check if product has pending orders
        $pendingOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.product_id', $product->id)
            ->whereIn('orders.status', ['pending', 'processing', 'shipped'])
            ->exists();

        if ($pendingOrders) {
            return response()->json([
                'message' => 'Cannot delete product with pending orders',
            ], 400);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Toggle product status (active/inactive).
     */
    public function toggleStatus(Product $product): JsonResponse
    {
        $merchant = request()->user()->merchant;

        // Verify product belongs to merchant
        if ($product->merchant_id !== $merchant->id) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'message' => 'Product status updated successfully',
            'product' => $product,
        ]);
    }
}