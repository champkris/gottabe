<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MerchantDashboardController extends Controller
{
    /**
     * Get merchant dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant) {
            return response()->json(['message' => 'Merchant profile not found'], 404);
        }

        // Get current month stats
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        // Revenue stats
        $currentMonthRevenue = $merchant->orders()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $currentMonth)
            ->sum('merchant_payout');

        $lastMonthRevenue = $merchant->orders()
            ->where('status', 'delivered')
            ->whereBetween('created_at', [$lastMonth, $currentMonth])
            ->sum('merchant_payout');

        $revenueGrowth = $lastMonthRevenue > 0
            ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100
            : 0;

        // Order stats
        $pendingOrders = $merchant->orders()->where('status', 'pending')->count();
        $processingOrders = $merchant->orders()->where('status', 'processing')->count();
        $totalOrders = $merchant->orders()->count();

        // Product stats
        $activeProducts = $merchant->products()->where('is_active', true)->count();
        $lowStockProducts = $merchant->products()
            ->where('is_active', true)
            ->whereColumn('stock', '<=', 'min_stock')
            ->count();
        $outOfStockProducts = $merchant->products()
            ->where('is_active', true)
            ->where('stock', 0)
            ->count();

        // Recent orders
        $recentOrders = $merchant->orders()
            ->with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Best selling products
        $bestSellingProducts = $merchant->products()
            ->select('id', 'name', 'price', 'total_sales', 'stock')
            ->orderBy('total_sales', 'desc')
            ->limit(5)
            ->get();

        // Sales chart data (last 7 days)
        $salesData = $merchant->orders()
            ->where('status', 'delivered')
            ->where('created_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(merchant_payout) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats' => [
                'revenue' => [
                    'current_month' => $currentMonthRevenue,
                    'last_month' => $lastMonthRevenue,
                    'growth' => round($revenueGrowth, 2),
                ],
                'orders' => [
                    'pending' => $pendingOrders,
                    'processing' => $processingOrders,
                    'total' => $totalOrders,
                ],
                'products' => [
                    'active' => $activeProducts,
                    'low_stock' => $lowStockProducts,
                    'out_of_stock' => $outOfStockProducts,
                ],
                'rating' => $merchant->rating,
                'total_reviews' => $merchant->total_reviews,
            ],
            'recent_orders' => $recentOrders,
            'best_selling_products' => $bestSellingProducts,
            'sales_chart' => $salesData,
            'merchant' => $merchant,
        ]);
    }

    /**
     * Get merchant profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant) {
            return response()->json(['message' => 'Merchant profile not found'], 404);
        }

        return response()->json($merchant);
    }

    /**
     * Get merchant status.
     */
    public function status(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        return response()->json([
            'is_approved' => $merchant ? $merchant->is_approved : false,
            'merchant' => $merchant,
        ]);
    }

    /**
     * Update merchant profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant) {
            return response()->json(['message' => 'Merchant profile not found'], 404);
        }

        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'business_description' => 'sometimes|string',
            'business_email' => 'sometimes|email',
            'business_phone' => 'sometimes|string|max:20',
            'business_address' => 'sometimes|string',
            'business_hours' => 'sometimes|array',
            'social_links' => 'sometimes|array',
        ]);

        $merchant->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'merchant' => $merchant,
        ]);
    }

    /**
     * Get sales analytics.
     */
    public function salesAnalytics(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $period = $request->get('period', '30'); // days

        $startDate = now()->subDays($period);

        // Daily sales
        $dailySales = $merchant->orders()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(merchant_payout) as revenue'),
                DB::raw('SUM(commission_amount) as commission'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(subtotal) as gross_sales')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Category breakdown
        $categoryBreakdown = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.merchant_id', $merchant->id)
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'categories.name as category',
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as orders')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        // Customer insights
        $topCustomers = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('orders.merchant_id', $merchant->id)
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(merchant_payout) as total_spent')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'daily_sales' => $dailySales,
            'category_breakdown' => $categoryBreakdown,
            'top_customers' => $topCustomers,
            'period' => $period,
        ]);
    }

    /**
     * Get product analytics.
     */
    public function productAnalytics(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        // Product performance
        $products = $merchant->products()
            ->select(
                'id',
                'name',
                'price',
                'stock',
                'total_sales',
                'rating',
                'total_reviews',
                'views',
                DB::raw('(total_sales * price) as revenue')
            )
            ->orderBy('revenue', 'desc')
            ->get();

        // Calculate conversion rates
        $products->each(function ($product) {
            $product->conversion_rate = $product->views > 0
                ? round(($product->total_sales / $product->views) * 100, 2)
                : 0;
        });

        // Stock alerts
        $stockAlerts = $merchant->products()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('stock', '=', 0)
                      ->orWhereColumn('stock', '<=', 'min_stock');
            })
            ->select('id', 'name', 'stock', 'min_stock')
            ->get();

        return response()->json([
            'products' => $products,
            'stock_alerts' => $stockAlerts,
        ]);
    }

    /**
     * Get general analytics.
     */
    public function analytics(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (!$merchant) {
            return response()->json(['message' => 'Merchant profile not found'], 404);
        }

        // Combine all analytics
        $salesAnalytics = $this->salesAnalytics($request)->getData();
        $productAnalytics = $this->productAnalytics($request)->getData();

        return response()->json([
            'sales' => $salesAnalytics,
            'products' => $productAnalytics,
        ]);
    }
}