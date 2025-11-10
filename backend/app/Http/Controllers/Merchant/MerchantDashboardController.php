<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class MerchantDashboardController extends Controller
{
    /**
     * Get creator/merchant dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $creator = $request->user()->creator ?? $request->user()->merchant;

        if (!$creator) {
            return response()->json(['message' => 'Creator profile not found'], 404);
        }

        // Calculate total sales from products
        $totalSales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->sum('order_items.subtotal');

        // Calculate total units sold
        $totalUnitsSold = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->sum('order_items.quantity');

        // Calculate commission earned (fixed amount per piece)
        $commissionEarned = $totalUnitsSold * $creator->commission_amount;

        // Get current month sales
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        $currentMonthSales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', $currentMonth)
            ->sum('order_items.subtotal');

        $lastMonthSales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->whereBetween('orders.created_at', [$lastMonth, $currentMonth])
            ->sum('order_items.subtotal');

        $salesGrowth = $lastMonthSales > 0
            ? (($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100
            : 0;

        // Total orders count
        $totalOrders = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->distinct('orders.id')
            ->count('orders.id');

        // Product stats
        $totalProducts = $creator->products()->count();
        $activeProducts = $creator->products()->where('is_active', true)->count();

        // Best selling products
        $bestSellingProducts = $creator->products()
            ->withCount(['orderItems as units_sold' => function ($query) {
                $query->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', '!=', 'cancelled');
            }])
            ->with('category')
            ->orderBy('units_sold', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($product) use ($creator) {
                $revenue = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('order_items.product_id', $product->id)
                    ->where('orders.status', '!=', 'cancelled')
                    ->sum('order_items.subtotal');

                $unitsSold = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('order_items.product_id', $product->id)
                    ->where('orders.status', '!=', 'cancelled')
                    ->sum('order_items.quantity');

                $product->revenue = $revenue;
                $product->commission = $unitsSold * $creator->commission_amount;
                return $product;
            });

        // Sales chart data (last 30 days)
        $salesData = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('products.merchant_id', $creator->id)
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.subtotal) as sales'),
                DB::raw('COUNT(DISTINCT orders.id) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_sales' => $totalSales,
            'commission_amount' => $creator->commission_amount,
            'commission_earned' => $commissionEarned,
            'total_units_sold' => $totalUnitsSold,
            'total_revenue' => $totalSales,
            'total_orders' => $totalOrders,
            'total_products' => $totalProducts,
            'active_products' => $activeProducts,
            'current_month_sales' => $currentMonthSales,
            'last_month_sales' => $lastMonthSales,
            'sales_growth' => round($salesGrowth, 2),
            'best_selling_products' => $bestSellingProducts,
            'sales_chart' => $salesData,
            'creator' => $creator,
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