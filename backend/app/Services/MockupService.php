<?php

namespace App\Services;

use App\Models\Artwork;
use App\Models\MerchandiseType;
use App\Models\PlacementOption;
use Illuminate\Support\Facades\Storage;

class MockupService
{
    /**
     * Generate a mockup image by overlaying artwork on merchandise template.
     *
     * @param int $merchandiseTypeId
     * @param int $artworkId
     * @param int $placementOptionId
     * @param string|null $color
     * @return string Path to the generated mockup image
     */
    public function generateMockup(
        int $merchandiseTypeId,
        int $artworkId,
        int $placementOptionId,
        ?string $color = null
    ): string {
        $merchandise = MerchandiseType::findOrFail($merchandiseTypeId);
        $artwork = Artwork::findOrFail($artworkId);
        $placement = PlacementOption::findOrFail($placementOptionId);

        // Load artwork
        $artworkPath = Storage::disk('public')->path($artwork->file_path);

        if (!file_exists($artworkPath)) {
            throw new \Exception('Artwork file not found');
        }

        // Create canvas (600x800 - standard t-shirt mockup size)
        $canvas = imagecreatetruecolor(600, 800);

        // Set background color (white or specified color)
        $bgColor = $this->parseColor($color ?? '#FFFFFF');
        $background = imagecolorallocate($canvas, $bgColor[0], $bgColor[1], $bgColor[2]);
        imagefill($canvas, 0, 0, $background);

        // Load artwork image based on file type
        $artworkImage = $this->loadImage($artworkPath, $artwork->file_type);

        if (!$artworkImage) {
            throw new \Exception('Failed to load artwork image');
        }

        // Get placement coordinates
        $coords = $placement->position_coordinates;

        if ($coords) {
            // Calculate scaled dimensions maintaining aspect ratio
            $artworkWidth = imagesx($artworkImage);
            $artworkHeight = imagesy($artworkImage);

            $maxWidth = $coords['maxWidth'] ?? 280;
            $maxHeight = $coords['maxHeight'] ?? 350;

            // Scale down artwork to fit placement area
            $scale = min($maxWidth / $artworkWidth, $maxHeight / $artworkHeight);
            if ($scale > 1) $scale = 1; // Don't upscale

            $newWidth = (int)($artworkWidth * $scale);
            $newHeight = (int)($artworkHeight * $scale);

            // Resize artwork
            $resizedArtwork = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($resizedArtwork, false);
            imagesavealpha($resizedArtwork, true);

            imagecopyresampled(
                $resizedArtwork,
                $artworkImage,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $artworkWidth, $artworkHeight
            );

            // Place artwork on canvas
            imagecopy(
                $canvas,
                $resizedArtwork,
                $coords['x'] ?? 150,
                $coords['y'] ?? 120,
                0, 0,
                $newWidth, $newHeight
            );

            imagedestroy($resizedArtwork);
        }

        imagedestroy($artworkImage);

        // Generate unique filename
        $filename = 'mockups/' . time() . '_' . uniqid() . '.png';
        $fullPath = Storage::disk('public')->path($filename);

        // Ensure mockups directory exists
        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Save the mockup
        imagepng($canvas, $fullPath);
        imagedestroy($canvas);

        return $filename;
    }

    /**
     * Load image based on file type.
     */
    protected function loadImage(string $path, string $type)
    {
        $type = strtolower($type);

        switch ($type) {
            case 'png':
                return imagecreatefrompng($path);
            case 'jpg':
            case 'jpeg':
                return imagecreatefromjpeg($path);
            case 'gif':
                return imagecreatefromgif($path);
            case 'webp':
                return imagecreatefromwebp($path);
            default:
                // Try PNG as default
                return imagecreatefrompng($path);
        }
    }

    /**
     * Parse hex color to RGB array.
     */
    protected function parseColor(string $hex): array
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) == 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }

        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        ];
    }

    /**
     * Delete a mockup file.
     */
    public function deleteMockup(string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Get mockup URL.
     */
    public function getMockupUrl(string $path): string
    {
        return Storage::disk('public')->url($path);
    }
}
