<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Additional check for merchant approval
        if ($request->user()->role === 'merchant') {
            $merchant = $request->user()->merchant;
            if (!$merchant || !$merchant->is_approved) {
                // Allow access to profile and basic merchant info routes
                $allowedRoutes = ['api.merchant.profile', 'api.merchant.status'];
                if (!$request->routeIs($allowedRoutes)) {
                    return response()->json([
                        'message' => 'Your merchant account is pending approval',
                        'is_approved' => false,
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}