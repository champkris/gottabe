<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminProductController extends Controller
{
    /**
     * Get all products with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'merchant.user']);

        // Filter by category
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        // Filter by creator/merchant
        if ($request->has('merchant_id')) {
            $query->where('merchant_id', $request->merchant_id);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'featured') {
                $query->where('is_featured', true);
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    /**
     * Get single product details
     */
    public function show($id): JsonResponse
    {
        $product = Product::with(['category', 'merchant.user', 'reviews'])
            ->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update product
     */
    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'images' => 'sometimes|array',
            'images.*' => 'string', // Accept both URLs and local paths
            'available_from' => 'nullable|date',
            'available_to' => 'nullable|date|after_or_equal:available_from',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load(['category', 'merchant']),
        ]);
    }

    /**
     * Delete product
     */
    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        // Check if product has orders
        if ($product->orderItems()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product with existing orders',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Toggle product active status
     */
    public function toggleStatus($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json([
            'message' => 'Product status updated successfully',
            'product' => $product,
        ]);
    }

    /**
     * Toggle product featured status
     */
    public function toggleFeatured($id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->is_featured = !$product->is_featured;
        $product->save();

        return response()->json([
            'message' => 'Product featured status updated successfully',
            'product' => $product,
        ]);
    }

    /**
     * Bulk update products
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'action' => 'required|in:activate,deactivate,feature,unfeature,delete',
        ]);

        $products = Product::whereIn('id', $validated['product_ids'])->get();

        switch ($validated['action']) {
            case 'activate':
                $products->each(fn($p) => $p->update(['is_active' => true]));
                $message = 'Products activated successfully';
                break;
            case 'deactivate':
                $products->each(fn($p) => $p->update(['is_active' => false]));
                $message = 'Products deactivated successfully';
                break;
            case 'feature':
                $products->each(fn($p) => $p->update(['is_featured' => true]));
                $message = 'Products featured successfully';
                break;
            case 'unfeature':
                $products->each(fn($p) => $p->update(['is_featured' => false]));
                $message = 'Products unfeatured successfully';
                break;
            case 'delete':
                foreach ($products as $product) {
                    if ($product->orderItems()->count() === 0) {
                        $product->delete();
                    }
                }
                $message = 'Products deleted successfully';
                break;
            default:
                $message = 'Action completed';
        }

        return response()->json(['message' => $message]);
    }
}
