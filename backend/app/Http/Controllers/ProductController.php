<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['merchant', 'category'])
            ->where('is_active', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            });

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by merchant
        if ($request->has('merchant')) {
            $query->where('merchant_id', $request->merchant);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('total_sales', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $products = $query->paginate($request->get('per_page', 12));

        // Update view count for listed products
        Product::whereIn('id', $products->pluck('id'))->increment('views');

        return response()->json($products);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        if (!$product->is_active || !$product->merchant->is_approved) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Load relationships
        $product->load(['merchant', 'category', 'reviews' => function ($query) {
            $query->where('is_approved', true)
                  ->with('user')
                  ->latest()
                  ->limit(5);
        }]);

        // Increment view count
        $product->increment('views');

        // Get related products
        $relatedProducts = Product::with(['merchant', 'category'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            })
            ->limit(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related_products' => $relatedProducts,
        ]);
    }

    /**
     * Get featured products.
     */
    public function featured(): JsonResponse
    {
        $products = Product::with(['merchant', 'category'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            })
            ->limit(8)
            ->get();

        return response()->json($products);
    }

    /**
     * Get best selling products.
     */
    public function bestSelling(): JsonResponse
    {
        $products = Product::with(['merchant', 'category'])
            ->where('is_active', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            })
            ->orderBy('total_sales', 'desc')
            ->limit(8)
            ->get();

        return response()->json($products);
    }

    /**
     * Get new arrivals.
     */
    public function newArrivals(): JsonResponse
    {
        $products = Product::with(['merchant', 'category'])
            ->where('is_active', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            })
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json($products);
    }
}