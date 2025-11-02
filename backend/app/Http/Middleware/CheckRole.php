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

        // Additional check for creator approval
        if ($request->user()->role === 'creator') {
            $creator = $request->user()->creator ?? $request->user()->merchant;
            if (!$creator || !$creator->is_approved) {
                // Allow access to profile and basic creator info routes
                $allowedRoutes = ['api.creator.profile', 'api.creator.status'];
                if (!$request->routeIs($allowedRoutes)) {
                    return response()->json([
                        'message' => 'Your creator account is pending approval',
                        'is_approved' => false,
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}