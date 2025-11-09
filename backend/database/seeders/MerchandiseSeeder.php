<?php

namespace Database\Seeders;

use App\Models\MerchandiseType;
use App\Models\PlacementOption;
use Illuminate\Database\Seeder;

class MerchandiseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Placement Options
        $front = PlacementOption::create([
            'name' => 'Front',
            'slug' => 'front',
            'description' => 'Front center placement',
            'position_coordinates' => [
                'x' => 150,
                'y' => 120,
                'maxWidth' => 280,
                'maxHeight' => 350,
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $back = PlacementOption::create([
            'name' => 'Back',
            'slug' => 'back',
            'description' => 'Back center placement',
            'position_coordinates' => [
                'x' => 150,
                'y' => 100,
                'maxWidth' => 280,
                'maxHeight' => 350,
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $leftChest = PlacementOption::create([
            'name' => 'Left Chest',
            'slug' => 'left-chest',
            'description' => 'Left chest pocket area',
            'position_coordinates' => [
                'x' => 80,
                'y' => 80,
                'maxWidth' => 100,
                'maxHeight' => 100,
            ],
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $rightChest = PlacementOption::create([
            'name' => 'Right Chest',
            'slug' => 'right-chest',
            'description' => 'Right chest pocket area',
            'position_coordinates' => [
                'x' => 380,
                'y' => 80,
                'maxWidth' => 100,
                'maxHeight' => 100,
            ],
            'is_active' => true,
            'sort_order' => 4,
        ]);

        // Create T-Shirt Regular
        $tshirtRegular = MerchandiseType::create([
            'name' => 'T-Shirt Regular',
            'slug' => 't-shirt-regular',
            'description' => 'Classic fit cotton t-shirt',
            'base_price' => 299.00,
            'template_image' => '/templates/tshirt-regular.png',
            'sizes' => ['S', 'M', 'L', 'XL', '2XL'],
            'colors' => [
                ['name' => 'White', 'code' => '#FFFFFF'],
                ['name' => 'Black', 'code' => '#000000'],
                ['name' => 'Navy', 'code' => '#001f3f'],
                ['name' => 'Gray', 'code' => '#AAAAAA'],
            ],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // Create T-Shirt Oversize
        $tshirtOversize = MerchandiseType::create([
            'name' => 'T-Shirt Oversize',
            'slug' => 't-shirt-oversize',
            'description' => 'Relaxed oversized fit cotton t-shirt',
            'base_price' => 349.00,
            'template_image' => '/templates/tshirt-oversize.png',
            'sizes' => ['S', 'M', 'L', 'XL', '2XL'],
            'colors' => [
                ['name' => 'White', 'code' => '#FFFFFF'],
                ['name' => 'Black', 'code' => '#000000'],
                ['name' => 'Beige', 'code' => '#F5F5DC'],
                ['name' => 'Olive', 'code' => '#808000'],
            ],
            'is_active' => true,
            'sort_order' => 2,
        ]);

        // Attach placements to T-Shirt Regular
        $tshirtRegular->placementOptions()->attach([
            $front->id => ['price_modifier' => 0],
            $back->id => ['price_modifier' => 30],
            $leftChest->id => ['price_modifier' => 20],
            $rightChest->id => ['price_modifier' => 20],
        ]);

        // Attach placements to T-Shirt Oversize
        $tshirtOversize->placementOptions()->attach([
            $front->id => ['price_modifier' => 0],
            $back->id => ['price_modifier' => 40],
            $leftChest->id => ['price_modifier' => 25],
            $rightChest->id => ['price_modifier' => 25],
        ]);

        $this->command->info('✅ Merchandise types and placements created successfully!');
        $this->command->info('📦 Created: T-Shirt Regular, T-Shirt Oversize');
        $this->command->info('📍 Placements: Front, Back, Left Chest, Right Chest');
    }
}
