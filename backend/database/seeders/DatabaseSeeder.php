<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Category;
use App\Models\Product;
use App\Models\Artwork;
use App\Models\MerchandiseType;
use App\Models\PlacementOption;
use App\Services\MockupService;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Users
        $customer = User::create([
            'name' => 'John Customer',
            'email' => 'customer@demo.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'phone' => '123-456-7890',
            'address' => '123 Customer Street, City',
        ]);

        // Create Creators
        $creator1User = User::create([
            'name' => 'Sarah Creator',
            'email' => 'creator@demo.com',
            'password' => Hash::make('password'),
            'role' => 'creator',
            'phone' => '098-765-4321',
            'address' => '456 Creator Avenue, Bangkok',
        ]);

        $creator2User = User::create([
            'name' => 'Mike Designer',
            'email' => 'mike@demo.com',
            'password' => Hash::make('password'),
            'role' => 'creator',
            'phone' => '098-765-4322',
            'address' => '789 Design Street, Bangkok',
        ]);

        $creator3User = User::create([
            'name' => 'Emma Artist',
            'email' => 'emma@demo.com',
            'password' => Hash::make('password'),
            'role' => 'creator',
            'phone' => '098-765-4323',
            'address' => '321 Art Boulevard, Bangkok',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@demo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Creator 1 - Gottabe Studio (10 THB per piece commission)
        $creator1 = Merchant::create([
            'user_id' => $creator1User->id,
            'business_name' => 'Gottabe Studio',
            'slug' => 'gottabe-studio',
            'business_description' => 'Premium designs and collections for awesome people',
            'business_email' => 'studio@gottabe.com',
            'business_phone' => '555-123-4567',
            'business_address' => '789 Creative Plaza, Bangkok',
            'commission_amount' => 10.00,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create Creator 2 - TechVibe Designs (8 THB per piece commission)
        $creator2 = Merchant::create([
            'user_id' => $creator2User->id,
            'business_name' => 'TechVibe Designs',
            'slug' => 'techvibe-designs',
            'business_description' => 'Modern tech-inspired designs for the digital age',
            'business_email' => 'hello@techvibe.com',
            'business_phone' => '555-234-5678',
            'business_address' => '456 Innovation Center, Bangkok',
            'commission_amount' => 8.00,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create Creator 3 - Artistic Touch (12 THB per piece commission)
        $creator3 = Merchant::create([
            'user_id' => $creator3User->id,
            'business_name' => 'Artistic Touch',
            'slug' => 'artistic-touch',
            'business_description' => 'Handcrafted artistic designs with a personal touch',
            'business_email' => 'contact@artistictouch.com',
            'business_phone' => '555-345-6789',
            'business_address' => '123 Gallery District, Bangkok',
            'commission_amount' => 12.00,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create Categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Latest electronic devices and gadgets',
            'is_active' => true,
        ]);

        $fashion = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'description' => 'Trendy clothing and accessories',
            'is_active' => true,
        ]);

        $homeAndLiving = Category::create([
            'name' => 'Home & Living',
            'slug' => 'home-living',
            'description' => 'Home decor and living essentials',
            'is_active' => true,
        ]);

        // Seed Merchandise Types and Placement Options first
        $this->call(MerchandiseSeeder::class);

        // Get merchandise types and placements
        $tshirtRegular = MerchandiseType::where('slug', 't-shirt-regular')->first();
        $tshirtOversize = MerchandiseType::where('slug', 't-shirt-oversize')->first();
        $frontPlacement = PlacementOption::where('slug', 'front')->first();
        $backPlacement = PlacementOption::where('slug', 'back')->first();

        // Create sample artworks for each creator
        $artworks = $this->createArtworks($creator1, $creator2, $creator3);

        // Initialize MockupService
        $mockupService = new MockupService();

        // Create Products - All as T-Shirts with mockups
        $products = [
            // Creator 1 - Gottabe Studio T-Shirts
            [
                'merchant_id' => $creator1->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtRegular->id,
                'artwork_id' => $artworks['creator1'][0]->id,
                'placement_option_id' => $frontPlacement->id,
                'name' => 'Sunset Dreams T-Shirt',
                'description' => 'Beautiful sunset gradient design on premium cotton t-shirt. Express your love for nature with this stunning artwork.',
                'price' => 499.00,
                'sale_price' => 399.00,
                'stock' => 100,
                'size' => 'M',
                'color' => '#FFFFFF',
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.5,
                'total_reviews' => 125,
            ],
            [
                'merchant_id' => $creator1->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtOversize->id,
                'artwork_id' => $artworks['creator1'][1]->id,
                'placement_option_id' => $frontPlacement->id,
                'name' => 'Abstract Waves Oversize Tee',
                'description' => 'Trendy oversize fit with bold abstract wave design. Perfect for casual streetwear style.',
                'price' => 549.00,
                'sale_price' => 449.00,
                'stock' => 80,
                'size' => 'L',
                'color' => '#000000',
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.7,
                'total_reviews' => 89,
            ],

            // Creator 2 - TechVibe Designs T-Shirts
            [
                'merchant_id' => $creator2->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtRegular->id,
                'artwork_id' => $artworks['creator2'][0]->id,
                'placement_option_id' => $backPlacement->id,
                'name' => 'Cyber Circuit T-Shirt',
                'description' => 'Tech-inspired circuit board design. For those who live and breathe technology.',
                'price' => 499.00,
                'stock' => 75,
                'size' => 'M',
                'color' => '#FFFFFF',
                'is_active' => true,
                'rating' => 4.3,
                'total_reviews' => 54,
            ],
            [
                'merchant_id' => $creator2->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtOversize->id,
                'artwork_id' => $artworks['creator2'][1]->id,
                'placement_option_id' => $frontPlacement->id,
                'name' => 'Digital Dreams Oversize',
                'description' => 'Futuristic digital art on comfortable oversize tee. Stand out from the crowd.',
                'price' => 549.00,
                'stock' => 100,
                'size' => 'XL',
                'color' => '#1E293B',
                'is_active' => true,
                'rating' => 4.6,
                'total_reviews' => 78,
            ],

            // Creator 3 - Artistic Touch T-Shirts
            [
                'merchant_id' => $creator3->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtRegular->id,
                'artwork_id' => $artworks['creator3'][0]->id,
                'placement_option_id' => $frontPlacement->id,
                'name' => 'Artistic Expression Tee',
                'description' => 'Handcrafted artistic design that speaks volumes. Wear your creativity proudly.',
                'price' => 599.00,
                'stock' => 60,
                'size' => 'M',
                'color' => '#FFFFFF',
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.8,
                'total_reviews' => 67,
            ],
            [
                'merchant_id' => $creator3->id,
                'category_id' => $fashion->id,
                'merchandise_type_id' => $tshirtOversize->id,
                'artwork_id' => $artworks['creator3'][1]->id,
                'placement_option_id' => $frontPlacement->id,
                'name' => 'Modern Art Oversize Tee',
                'description' => 'Contemporary art meets street fashion. Oversize comfort with artistic flair.',
                'price' => 649.00,
                'sale_price' => 549.00,
                'stock' => 50,
                'size' => 'L',
                'color' => '#F3F4F6',
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.9,
                'total_reviews' => 56,
            ],
        ];

        // Create products with mockup generation
        foreach ($products as $productData) {
            try {
                // Generate mockup
                $mockupPath = $mockupService->generateMockup(
                    $productData['merchandise_type_id'],
                    $productData['artwork_id'],
                    $productData['placement_option_id'],
                    $productData['color']
                );

                $productData['mockup_image'] = $mockupPath;
                $productData['images'] = [$mockupService->getMockupUrl($mockupPath)];

                Product::create($productData);
                echo "✓ Created product: {$productData['name']}\n";
            } catch (\Exception $e) {
                echo "✗ Failed to create product: {$productData['name']} - {$e->getMessage()}\n";
            }
        }

        echo "\n✅ Database seeded successfully!\n";
        echo "📧 Demo accounts:\n";
        echo "   Customer: customer@demo.com / password\n";
        echo "   Creator: creator@demo.com / password\n";
        echo "   Admin: admin@demo.com / password\n\n";
    }

    /**
     * Create sample artworks for creators
     */
    private function createArtworks($creator1, $creator2, $creator3): array
    {
        $artworkPath = storage_path('app/public/artworks');
        if (!file_exists($artworkPath)) {
            mkdir($artworkPath, 0755, true);
        }

        $artworks = [
            'creator1' => [],
            'creator2' => [],
            'creator3' => [],
        ];

        // Creator 1 Artworks - Sunset theme
        $artworks['creator1'][] = $this->createArtworkImage(
            $creator1,
            'Sunset Dreams',
            'sunset-dreams',
            '#FF6B6B',
            '#FFE66D',
            '#4ECDC4'
        );

        $artworks['creator1'][] = $this->createArtworkImage(
            $creator1,
            'Abstract Waves',
            'abstract-waves',
            '#6C5CE7',
            '#A29BFE',
            '#74B9FF'
        );

        // Creator 2 Artworks - Tech theme
        $artworks['creator2'][] = $this->createArtworkImage(
            $creator2,
            'Cyber Circuit',
            'cyber-circuit',
            '#00B894',
            '#00CEC9',
            '#81ECEC'
        );

        $artworks['creator2'][] = $this->createArtworkImage(
            $creator2,
            'Digital Dreams',
            'digital-dreams',
            '#FD79A8',
            '#FDCB6E',
            '#E17055'
        );

        // Creator 3 Artworks - Artistic theme
        $artworks['creator3'][] = $this->createArtworkImage(
            $creator3,
            'Artistic Expression',
            'artistic-expression',
            '#F093FB',
            '#F5576C',
            '#4FACFE'
        );

        $artworks['creator3'][] = $this->createArtworkImage(
            $creator3,
            'Modern Art',
            'modern-art',
            '#43E97B',
            '#38F9D7',
            '#667EEA'
        );

        return $artworks;
    }

    /**
     * Create an artwork image and database record
     */
    private function createArtworkImage($creator, $name, $slug, $color1, $color2, $color3)
    {
        $width = 400;
        $height = 400;
        $image = imagecreatetruecolor($width, $height);

        // Enable alpha blending
        imagealphablending($image, true);
        imagesavealpha($image, true);

        // Parse colors
        $c1 = $this->hexToRgb($color1);
        $c2 = $this->hexToRgb($color2);
        $c3 = $this->hexToRgb($color3);

        // Create gradient background
        for ($y = 0; $y < $height; $y++) {
            $ratio = $y / $height;
            $r = (int)($c1[0] * (1 - $ratio) + $c2[0] * $ratio);
            $g = (int)($c1[1] * (1 - $ratio) + $c2[1] * $ratio);
            $b = (int)($c1[2] * (1 - $ratio) + $c2[2] * $ratio);
            $color = imagecolorallocate($image, $r, $g, $b);
            imageline($image, 0, $y, $width, $y, $color);
        }

        // Add decorative shapes
        $shapeColor = imagecolorallocate($image, $c3[0], $c3[1], $c3[2]);
        imagefilledellipse($image, 100, 100, 80, 80, $shapeColor);
        imagefilledellipse($image, 300, 300, 100, 100, $shapeColor);
        imagefilledellipse($image, 200, 250, 60, 60, $shapeColor);

        // Save image
        $filename = $slug . '-' . time() . '.png';
        $fullPath = storage_path('app/public/artworks/' . $filename);
        imagepng($image, $fullPath);
        imagedestroy($image);

        // Create database record
        $artwork = Artwork::create([
            'merchant_id' => $creator->id,
            'name' => $name,
            'description' => "Beautiful {$name} artwork design",
            'file_path' => 'artworks/' . $filename,
            'file_type' => 'png',
            'width' => $width,
            'height' => $height,
            'file_size' => filesize($fullPath),
            'is_active' => true,
        ]);

        echo "✓ Created artwork: {$name}\n";

        return $artwork;
    }

    /**
     * Convert hex color to RGB array
     */
    private function hexToRgb($hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        ];
    }
}
