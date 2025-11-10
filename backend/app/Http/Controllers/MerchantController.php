<?php

namespace App\Http\Controllers;

use App\Models\Merchant;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MerchantController extends Controller
{
    /**
     * Display a listing of merchants.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Merchant::where('is_approved', true);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $merchants = $query->paginate($request->get('per_page', 12));

        return response()->json($merchants);
    }

    /**
     * Display the specified merchant.
     */
    public function show(Merchant $merchant): JsonResponse
    {
        if (!$merchant->is_approved) {
            return response()->json(['message' => 'Merchant not found'], 404);
        }

        return response()->json($merchant);
    }

    /**
     * Get products for a specific merchant.
     */
    public function products(Request $request, Merchant $merchant): JsonResponse
    {
        if (!$merchant->is_approved) {
            return response()->json(['message' => 'Merchant not found'], 404);
        }

        $query = $merchant->products()
            ->with('category')
            ->where('is_active', true);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
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

        return response()->json($products);
    }
}
