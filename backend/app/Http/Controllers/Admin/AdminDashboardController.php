<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get admin dashboard overview.
     */
    public function index(): JsonResponse
    {
        // Total counts
        $totalUsers = User::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalCreators = User::where('role', 'creator')->count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalCategories = Category::count();

        // Revenue stats
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $totalCommission = Order::where('status', '!=', 'cancelled')->sum('commission_amount');
        $platformRevenue = $totalRevenue - $totalCommission;

        // Monthly stats
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        $currentMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $currentMonth)
            ->sum('total');

        $lastMonthRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$lastMonth, $currentMonth])
            ->sum('total');

        $revenueGrowth = $lastMonthRevenue > 0
            ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100
            : 0;

        $currentMonthOrders = Order::where('created_at', '>=', $currentMonth)->count();
        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $currentMonth])->count();

        $ordersGrowth = $lastMonthOrders > 0
            ? (($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100
            : 0;

        // Order status breakdown
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Recent orders
        $recentOrders = Order::with(['user', 'merchant'])
            ->latest()
            ->limit(5)
            ->get();

        // Top creators by sales
        $topCreators = Merchant::with('user')
            ->where('is_approved', true)
            ->get()
            ->map(function ($creator) {
                $totalSales = DB::table('order_items')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('products.merchant_id', $creator->id)
                    ->where('orders.status', '!=', 'cancelled')
                    ->sum('order_items.subtotal');

                $creator->total_sales = $totalSales;
                $creator->commission = $totalSales * ($creator->commission_rate / 100);
                return $creator;
            })
            ->sortByDesc('total_sales')
            ->take(5)
            ->values();

        // Sales chart (last 30 days)
        $salesChart = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'overview' => [
                'total_users' => $totalUsers,
                'total_customers' => $totalCustomers,
                'total_creators' => $totalCreators,
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'total_categories' => $totalCategories,
            ],
            'revenue' => [
                'total_revenue' => $totalRevenue,
                'total_commission' => $totalCommission,
                'platform_revenue' => $platformRevenue,
                'current_month' => $currentMonthRevenue,
                'last_month' => $lastMonthRevenue,
                'growth' => round($revenueGrowth, 2),
            ],
            'orders' => [
                'current_month' => $currentMonthOrders,
                'last_month' => $lastMonthOrders,
                'growth' => round($ordersGrowth, 2),
                'by_status' => $ordersByStatus,
            ],
            'recent_orders' => $recentOrders,
            'top_creators' => $topCreators,
            'sales_chart' => $salesChart,
        ]);
    }

    /**
     * Get detailed analytics.
     */
    public function analytics(): JsonResponse
    {
        $period = request()->get('period', 30);
        $startDate = now()->subDays($period);

        // Daily revenue and orders
        $dailyStats = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('SUM(commission_amount) as commission'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Category performance
        $categoryStats = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'categories.name as category',
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('COUNT(DISTINCT order_items.id) as items_sold')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();

        // Top products
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.subtotal) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'daily_stats' => $dailyStats,
            'category_stats' => $categoryStats,
            'top_products' => $topProducts,
            'period' => $period,
        ]);
    }

    /**
     * Get settings (placeholder for future implementation).
     */
    public function settings(): JsonResponse
    {
        return response()->json([
            'platform_name' => 'Marketplace',
            'platform_commission' => 15,
            'currency' => 'THB',
        ]);
    }

    /**
     * Update settings (placeholder for future implementation).
     */
    public function updateSettings(): JsonResponse
    {
        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }
}
