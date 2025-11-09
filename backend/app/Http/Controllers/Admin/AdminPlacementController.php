<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlacementOption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminPlacementController extends Controller
{
    /**
     * Display a listing of placement options.
     */
    public function index()
    {
        $placementOptions = PlacementOption::with('merchandiseTypes')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $placementOptions,
        ]);
    }

    /**
     * Store a newly created placement option.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:placement_options,slug',
            'description' => 'nullable|string',
            'position_coordinates' => 'nullable|array',
            'position_coordinates.x' => 'required_with:position_coordinates|numeric',
            'position_coordinates.y' => 'required_with:position_coordinates|numeric',
            'position_coordinates.maxWidth' => 'required_with:position_coordinates|numeric',
            'position_coordinates.maxHeight' => 'required_with:position_coordinates|numeric',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (PlacementOption::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        $placementOption = PlacementOption::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Placement option created successfully',
            'data' => $placementOption->load('merchandiseTypes'),
        ], 201);
    }

    /**
     * Display the specified placement option.
     */
    public function show($id)
    {
        $placementOption = PlacementOption::with('merchandiseTypes')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $placementOption,
        ]);
    }

    /**
     * Update the specified placement option.
     */
    public function update(Request $request, $id)
    {
        $placementOption = PlacementOption::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:placement_options,slug,' . $id,
            'description' => 'nullable|string',
            'position_coordinates' => 'nullable|array',
            'position_coordinates.x' => 'required_with:position_coordinates|numeric',
            'position_coordinates.y' => 'required_with:position_coordinates|numeric',
            'position_coordinates.maxWidth' => 'required_with:position_coordinates|numeric',
            'position_coordinates.maxHeight' => 'required_with:position_coordinates|numeric',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $placementOption->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Placement option updated successfully',
            'data' => $placementOption->load('merchandiseTypes'),
        ]);
    }

    /**
     * Remove the specified placement option.
     */
    public function destroy($id)
    {
        $placementOption = PlacementOption::findOrFail($id);

        // Check if placement option is used in products
        if ($placementOption->products()->count() > 0) {
            throw ValidationException::withMessages([
                'placement_option' => ['Cannot delete placement option that is used in products.'],
            ]);
        }

        $placementOption->delete();

        return response()->json([
            'success' => true,
            'message' => 'Placement option deleted successfully',
        ]);
    }
}
