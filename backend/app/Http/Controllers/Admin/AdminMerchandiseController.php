<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MerchandiseType;
use App\Models\PlacementOption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminMerchandiseController extends Controller
{
    /**
     * Display a listing of merchandise types.
     */
    public function index()
    {
        $merchandiseTypes = MerchandiseType::with('placementOptions')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $merchandiseTypes,
        ]);
    }

    /**
     * Store a newly created merchandise type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:merchandise_types,slug',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'template_image' => 'nullable|string',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'colors.*.name' => 'required_with:colors|string',
            'colors.*.code' => 'required_with:colors|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (MerchandiseType::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        $merchandiseType = MerchandiseType::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Merchandise type created successfully',
            'data' => $merchandiseType->load('placementOptions'),
        ], 201);
    }

    /**
     * Display the specified merchandise type.
     */
    public function show($id)
    {
        $merchandiseType = MerchandiseType::with('placementOptions')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $merchandiseType,
        ]);
    }

    /**
     * Update the specified merchandise type.
     */
    public function update(Request $request, $id)
    {
        $merchandiseType = MerchandiseType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:merchandise_types,slug,' . $id,
            'description' => 'nullable|string',
            'base_price' => 'sometimes|required|numeric|min:0',
            'template_image' => 'nullable|string',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'colors.*.name' => 'required_with:colors|string',
            'colors.*.code' => 'required_with:colors|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $merchandiseType->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Merchandise type updated successfully',
            'data' => $merchandiseType->load('placementOptions'),
        ]);
    }

    /**
     * Remove the specified merchandise type.
     */
    public function destroy($id)
    {
        $merchandiseType = MerchandiseType::findOrFail($id);

        // Check if merchandise type has products
        if ($merchandiseType->products()->count() > 0) {
            throw ValidationException::withMessages([
                'merchandise_type' => ['Cannot delete merchandise type that has products associated with it.'],
            ]);
        }

        $merchandiseType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Merchandise type deleted successfully',
        ]);
    }

    /**
     * Attach a placement option to merchandise type.
     */
    public function attachPlacement(Request $request, $id)
    {
        $merchandiseType = MerchandiseType::findOrFail($id);

        $validated = $request->validate([
            'placement_option_id' => 'required|exists:placement_options,id',
            'price_modifier' => 'required|numeric',
        ]);

        // Check if placement is already attached
        if ($merchandiseType->placementOptions()->where('placement_option_id', $validated['placement_option_id'])->exists()) {
            throw ValidationException::withMessages([
                'placement_option_id' => ['This placement option is already attached to this merchandise type.'],
            ]);
        }

        $merchandiseType->placementOptions()->attach($validated['placement_option_id'], [
            'price_modifier' => $validated['price_modifier'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Placement option attached successfully',
            'data' => $merchandiseType->load('placementOptions'),
        ]);
    }

    /**
     * Detach a placement option from merchandise type.
     */
    public function detachPlacement($merchandiseId, $placementId)
    {
        $merchandiseType = MerchandiseType::findOrFail($merchandiseId);
        $merchandiseType->placementOptions()->detach($placementId);

        return response()->json([
            'success' => true,
            'message' => 'Placement option detached successfully',
            'data' => $merchandiseType->load('placementOptions'),
        ]);
    }

    /**
     * Update placement price modifier.
     */
    public function updatePlacementPrice(Request $request, $merchandiseId, $placementId)
    {
        $merchandiseType = MerchandiseType::findOrFail($merchandiseId);

        $validated = $request->validate([
            'price_modifier' => 'required|numeric',
        ]);

        $merchandiseType->placementOptions()->updateExistingPivot($placementId, [
            'price_modifier' => $validated['price_modifier'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Price modifier updated successfully',
            'data' => $merchandiseType->load('placementOptions'),
        ]);
    }
}
