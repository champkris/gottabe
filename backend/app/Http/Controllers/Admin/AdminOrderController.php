<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminOrderController extends Controller
{
    /**
     * Get all orders with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'merchant', 'items.product']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }

        // Search by order ID or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * Get single order details.
     */
    public function show($id): JsonResponse
    {
        $order = Order::with([
            'user',
            'merchant',
            'items.product.category',
            'items.product.merchant'
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;

        if ($request->status === 'shipped' && $request->has('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
        }

        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load(['user', 'merchant']),
        ]);
    }

    /**
     * Cancel order.
     */
    public function cancel($id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'delivered') {
            return response()->json([
                'message' => 'Cannot cancel delivered orders',
            ], 422);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order,
        ]);
    }

    /**
     * Get order statistics.
     */
    public function statistics(): JsonResponse
    {
        $total = Order::count();
        $pending = Order::where('status', 'pending')->count();
        $processing = Order::where('status', 'processing')->count();
        $shipped = Order::where('status', 'shipped')->count();
        $delivered = Order::where('status', 'delivered')->count();
        $cancelled = Order::where('status', 'cancelled')->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'processing' => $processing,
            'shipped' => $shipped,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
        ]);
    }
}
