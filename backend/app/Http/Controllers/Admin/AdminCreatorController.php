<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminCreatorController extends Controller
{
    /**
     * Get all creators with their stats
     */
    public function index(Request $request)
    {
        $query = Merchant::with('user')
            ->select('merchants.*')
            ->join('users', 'merchants.user_id', '=', 'users.id')
            ->where('users.role', 'creator');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('merchants.business_name', 'like', "%{$search}%")
                    ->orWhere('users.name', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        // Filter by approval status
        if ($request->has('status')) {
            if ($request->status === 'approved') {
                $query->where('merchants.is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('merchants.is_approved', false);
            }
        }

        $creators = $query->latest('merchants.created_at')->paginate(20);

        // Get stats for each creator
        $creators->each(function ($creator) {
            $creator->total_products = $creator->products()->count();
            $creator->active_products = $creator->products()->where('is_active', true)->count();
            $creator->total_sales = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('products.merchant_id', $creator->id)
                ->sum('order_items.subtotal');
            $creator->total_orders = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('products.merchant_id', $creator->id)
                ->distinct('order_items.order_id')
                ->count('order_items.order_id');
            $creator->total_pieces_sold = DB::table('order_items')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('products.merchant_id', $creator->id)
                ->sum('order_items.quantity');
        });

        return response()->json($creators);
    }

    /**
     * Create new creator account
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'business_name' => 'required|string|max:255',
            'business_description' => 'nullable|string',
            'business_email' => 'required|email',
            'business_phone' => 'nullable|string|max:20',
            'business_address' => 'nullable|string',
            'commission_amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create user account
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'creator',
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);

            // Create creator profile
            $creator = Merchant::create([
                'user_id' => $user->id,
                'business_name' => $validated['business_name'],
                'slug' => Str::slug($validated['business_name']),
                'business_description' => $validated['business_description'] ?? null,
                'business_email' => $validated['business_email'],
                'business_phone' => $validated['business_phone'] ?? null,
                'business_address' => $validated['business_address'] ?? null,
                'commission_amount' => $validated['commission_amount'],
                'is_approved' => true,
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Creator created successfully',
                'creator' => $creator->load('user'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create creator',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single creator details
     */
    public function show($id)
    {
        $creator = Merchant::with(['user', 'products'])->findOrFail($id);

        // Calculate stats
        $creator->total_products = $creator->products()->count();
        $creator->active_products = $creator->products()->where('is_active', true)->count();
        $creator->total_sales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.merchant_id', $creator->id)
            ->sum('order_items.subtotal');
        $creator->total_orders = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.merchant_id', $creator->id)
            ->distinct('order_items.order_id')
            ->count('order_items.order_id');

        // Calculate commission earned (fixed amount per piece * total pieces sold)
        $totalPiecesSold = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.merchant_id', $creator->id)
            ->sum('order_items.quantity');
        $creator->commission_earned = $creator->commission_amount * $totalPiecesSold;

        return response()->json($creator);
    }

    /**
     * Update creator commission amount
     */
    public function updateCommission(Request $request, $id)
    {
        $request->validate([
            'commission_amount' => 'required|numeric|min:0',
        ]);

        $creator = Merchant::findOrFail($id);
        $creator->commission_amount = $request->commission_amount;
        $creator->save();

        return response()->json([
            'message' => 'Commission amount updated successfully',
            'creator' => $creator,
        ]);
    }

    /**
     * Approve creator account
     */
    public function approve($id)
    {
        $creator = Merchant::findOrFail($id);
        $creator->is_approved = true;
        $creator->approved_at = now();
        $creator->save();

        return response()->json([
            'message' => 'Creator approved successfully',
            'creator' => $creator,
        ]);
    }

    /**
     * Reject/suspend creator account
     */
    public function reject($id)
    {
        $creator = Merchant::findOrFail($id);
        $creator->is_approved = false;
        $creator->approved_at = null;
        $creator->save();

        return response()->json([
            'message' => 'Creator account suspended',
            'creator' => $creator,
        ]);
    }

    /**
     * Delete creator account
     */
    public function destroy($id)
    {
        $creator = Merchant::findOrFail($id);

        // Check if creator has products
        if ($creator->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete creator with existing products. Please delete products first.',
            ], 400);
        }

        $creator->delete();

        return response()->json([
            'message' => 'Creator deleted successfully',
        ]);
    }
}
