<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::where('is_active', true);

        // Get only root categories if requested
        if ($request->get('root_only')) {
            $query->whereNull('parent_id');
        }

        // Include children if requested
        if ($request->get('with_children')) {
            $query->with('children');
        }

        // Include product count
        if ($request->get('with_count')) {
            $query->withCount(['products' => function ($q) {
                $q->where('is_active', true);
            }]);
        }

        $categories = $query->orderBy('sort_order')->get();

        return response()->json($categories);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        if (!$category->is_active) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->load(['parent', 'children']);
        $category->loadCount('activeProducts');

        return response()->json($category);
    }

    /**
     * Get products in a category.
     */
    public function products(Category $category, Request $request): JsonResponse
    {
        if (!$category->is_active) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $query = $category->products()
            ->with(['merchant', 'category'])
            ->where('is_active', true)
            ->whereHas('merchant', function ($q) {
                $q->where('is_approved', true);
            });

        // Apply filters (price, brand, etc.)
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
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
                $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'category' => $category,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created category (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    /**
     * Update the specified category (Admin only).
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category,
        ]);
    }

    /**
     * Remove the specified category (Admin only).
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check if category has products
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with products',
            ], 400);
        }

        // Move children to parent
        if ($category->children()->exists()) {
            $category->children()->update(['parent_id' => $category->parent_id]);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}