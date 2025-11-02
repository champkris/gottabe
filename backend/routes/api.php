<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminMerchantController;
use App\Http\Controllers\Admin\AdminCreatorController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Merchant\MerchantDashboardController;
use App\Http\Controllers\Merchant\MerchantProductController;
use App\Http\Controllers\Merchant\MerchantOrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public product and category routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category:slug}', [CategoryController::class, 'show']);
Route::get('/categories/{category:slug}/products', [CategoryController::class, 'products']);

// Merchants public routes
Route::get('/merchants', [MerchantController::class, 'index']);
Route::get('/merchants/{merchant:slug}', [MerchantController::class, 'show']);
Route::get('/merchants/{merchant:slug}/products', [MerchantController::class, 'products']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });

    // Customer routes
    Route::middleware(['auth:sanctum'])->group(function () {
        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::put('/orders/{order}/cancel', [OrderController::class, 'cancel']);

        // Reviews
        Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    });

    // Creator routes
    Route::middleware(['check.role:creator'])->prefix('creator')->name('api.creator.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [MerchantDashboardController::class, 'index']);
        Route::get('/profile', [MerchantDashboardController::class, 'profile'])->name('profile');
        Route::get('/status', [MerchantDashboardController::class, 'status'])->name('status');
        Route::put('/profile', [MerchantDashboardController::class, 'updateProfile']);

        // Products
        Route::get('/products', [MerchantProductController::class, 'index']);
        Route::get('/products/{product}', [MerchantProductController::class, 'show']);
        Route::post('/products', [MerchantProductController::class, 'store']);
        Route::put('/products/{product}', [MerchantProductController::class, 'update']);
        Route::delete('/products/{product}', [MerchantProductController::class, 'destroy']);
        Route::put('/products/{product}/toggle-status', [MerchantProductController::class, 'toggleStatus']);

        // Analytics
        Route::get('/analytics', [MerchantDashboardController::class, 'analytics']);
        Route::get('/analytics/sales', [MerchantDashboardController::class, 'salesAnalytics']);
        Route::get('/analytics/products', [MerchantDashboardController::class, 'productAnalytics']);
    });

    // Merchant routes (legacy, kept for backward compatibility)
    Route::middleware(['check.role:merchant'])->prefix('merchant')->name('api.merchant.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [MerchantDashboardController::class, 'index']);
        Route::get('/profile', [MerchantDashboardController::class, 'profile'])->name('profile');
        Route::get('/status', [MerchantDashboardController::class, 'status'])->name('status');
        Route::put('/profile', [MerchantDashboardController::class, 'updateProfile']);

        // Products
        Route::get('/products', [MerchantProductController::class, 'index']);
        Route::get('/products/{product}', [MerchantProductController::class, 'show']);
        Route::post('/products', [MerchantProductController::class, 'store']);
        Route::put('/products/{product}', [MerchantProductController::class, 'update']);
        Route::delete('/products/{product}', [MerchantProductController::class, 'destroy']);
        Route::put('/products/{product}/toggle-status', [MerchantProductController::class, 'toggleStatus']);

        // Orders
        Route::get('/orders', [MerchantOrderController::class, 'index']);
        Route::get('/orders/{order}', [MerchantOrderController::class, 'show']);
        Route::put('/orders/{order}/status', [MerchantOrderController::class, 'updateStatus']);
        Route::put('/orders/{order}/tracking', [MerchantOrderController::class, 'updateTracking']);

        // Analytics
        Route::get('/analytics', [MerchantDashboardController::class, 'analytics']);
        Route::get('/analytics/sales', [MerchantDashboardController::class, 'salesAnalytics']);
        Route::get('/analytics/products', [MerchantDashboardController::class, 'productAnalytics']);
    });

    // Admin routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/analytics', [AdminDashboardController::class, 'analytics']);

        // Creators management
        Route::get('/creators', [AdminCreatorController::class, 'index']);
        Route::post('/creators', [AdminCreatorController::class, 'store']);
        Route::get('/creators/{creator}', [AdminCreatorController::class, 'show']);
        Route::put('/creators/{creator}/approve', [AdminCreatorController::class, 'approve']);
        Route::put('/creators/{creator}/reject', [AdminCreatorController::class, 'reject']);
        Route::put('/creators/{creator}/commission', [AdminCreatorController::class, 'updateCommission']);
        Route::delete('/creators/{creator}', [AdminCreatorController::class, 'destroy']);

        // Merchants management (legacy, kept for backward compatibility)
        Route::get('/merchants', [AdminMerchantController::class, 'index']);
        Route::get('/merchants/{merchant}', [AdminMerchantController::class, 'show']);
        Route::put('/merchants/{merchant}/approve', [AdminMerchantController::class, 'approve']);
        Route::put('/merchants/{merchant}/reject', [AdminMerchantController::class, 'reject']);
        Route::put('/merchants/{merchant}/commission', [AdminMerchantController::class, 'updateCommission']);

        // Orders management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::put('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::post('/orders/{order}/cancel', [AdminOrderController::class, 'cancel']);
        Route::get('/orders/statistics', [AdminOrderController::class, 'statistics']);

        // Categories management
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::get('/categories/{category}', [AdminCategoryController::class, 'show']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
        Route::post('/categories/{category}/toggle', [AdminCategoryController::class, 'toggleStatus']);

        // Products management
        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{product}', [AdminProductController::class, 'show']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
        Route::post('/products/{product}/toggle-status', [AdminProductController::class, 'toggleStatus']);
        Route::post('/products/{product}/toggle-featured', [AdminProductController::class, 'toggleFeatured']);
        Route::post('/products/bulk-update', [AdminProductController::class, 'bulkUpdate']);

        // Platform settings
        Route::get('/settings', [AdminDashboardController::class, 'settings']);
        Route::put('/settings', [AdminDashboardController::class, 'updateSettings']);
    });
});