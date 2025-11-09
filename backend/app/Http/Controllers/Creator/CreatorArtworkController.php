<?php

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CreatorArtworkController extends Controller
{
    /**
     * Display a listing of the creator's artworks.
     */
    public function index(Request $request)
    {
        $merchant = Merchant::where('user_id', $request->user()->id)->firstOrFail();

        $artworks = Artwork::where('merchant_id', $merchant->id)
            ->withCount('products')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $artworks,
        ]);
    }

    /**
     * Store a newly uploaded artwork.
     */
    public function store(Request $request)
    {
        $merchant = Merchant::where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|image|mimes:jpeg,png,jpg,svg|max:10240', // 10MB max
        ]);

        // Handle file upload
        $file = $request->file('file');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('artworks', $filename, 'public');

        // Get image dimensions
        $imageInfo = getimagesize($file->getRealPath());
        $width = $imageInfo[0] ?? null;
        $height = $imageInfo[1] ?? null;

        // Create artwork record
        $artwork = Artwork::create([
            'merchant_id' => $merchant->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'width' => $width,
            'height' => $height,
            'file_size' => $file->getSize(),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Artwork uploaded successfully',
            'data' => $artwork,
        ], 201);
    }

    /**
     * Display the specified artwork.
     */
    public function show(Request $request, $id)
    {
        $merchant = Merchant::where('user_id', $request->user()->id)->firstOrFail();

        $artwork = Artwork::where('merchant_id', $merchant->id)
            ->withCount('products')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $artwork,
        ]);
    }

    /**
     * Update the specified artwork.
     */
    public function update(Request $request, $id)
    {
        $merchant = Merchant::where('user_id', $request->user()->id)->firstOrFail();

        $artwork = Artwork::where('merchant_id', $merchant->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $artwork->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Artwork updated successfully',
            'data' => $artwork,
        ]);
    }

    /**
     * Remove the specified artwork.
     */
    public function destroy(Request $request, $id)
    {
        $merchant = Merchant::where('user_id', $request->user()->id)->firstOrFail();

        $artwork = Artwork::where('merchant_id', $merchant->id)->findOrFail($id);

        // Check if artwork is used in products
        if ($artwork->products()->count() > 0) {
            throw ValidationException::withMessages([
                'artwork' => ['Cannot delete artwork that is being used in products.'],
            ]);
        }

        // Delete the file from storage
        if ($artwork->file_path && Storage::disk('public')->exists($artwork->file_path)) {
            Storage::disk('public')->delete($artwork->file_path);
        }

        $artwork->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artwork deleted successfully',
        ]);
    }

    /**
     * Get artwork file URL.
     */
    public function getFileUrl($id)
    {
        $artwork = Artwork::findOrFail($id);

        if (!$artwork->file_path) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        $url = Storage::disk('public')->url($artwork->file_path);

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }
}
