<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class QuickDemoSeeder extends Seeder
{
    public function run()
    {
        // Create demo users
        $customer = User::create([
            'name' => 'John Customer',
            'email' => 'customer@demo.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        $creatorUser = User::create([
            'name' => 'Sarah Creator',
            'email' => 'creator@demo.com',
            'password' => Hash::make('password'),
            'role' => 'creator',
        ]);

        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@demo.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create creator profile
        $creator = Merchant::create([
            'user_id' => $creatorUser->id,
            'business_name' => 'Gottabe Studio',
            'slug' => 'gottabe-studio',
            'business_description' => 'Premium designs and collections for awesome people',
            'business_email' => 'studio@gottabe.com',
            'business_phone' => '555-0123',
            'business_address' => '123 Awesome Street, Bangkok',
            'commission_rate' => 30,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create categories
        $electronics = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products and gadgets',
            'is_active' => true,
        ]);

        $fashion = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'description' => 'Clothing and accessories',
            'is_active' => true,
        ]);

        $home = Category::create([
            'name' => 'Home & Living',
            'slug' => 'home-living',
            'description' => 'Home decor and furniture',
            'is_active' => true,
        ]);

        // Create awesome products
        $products = [
            [
                'merchant_id' => $creator->id,
                'category_id' => $electronics->id,
                'name' => 'Awesome Wireless Headphones',
                'slug' => 'awesome-wireless-headphones',
                'description' => 'Premium noise-cancelling headphones with 30-hour battery life. Perfect for your awesome lifestyle.',
                'price' => 2999.00,
                'sale_price' => 2499.00,
                'stock' => 50,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.8,
                'total_reviews' => 125,
                'images' => json_encode(['https://via.placeholder.com/400x400/4F46E5/ffffff?text=Headphones']),
            ],
            [
                'merchant_id' => $creator->id,
                'category_id' => $electronics->id,
                'name' => 'Smart Watch Pro',
                'slug' => 'smart-watch-pro',
                'description' => 'Track your fitness and stay connected with this awesome smartwatch.',
                'price' => 8999.00,
                'sale_price' => 7499.00,
                'stock' => 30,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.6,
                'total_reviews' => 89,
                'images' => json_encode(['https://via.placeholder.com/400x400/10B981/ffffff?text=SmartWatch']),
            ],
            [
                'merchant_id' => $creator->id,
                'category_id' => $fashion->id,
                'name' => 'Awesome Cotton T-Shirt',
                'slug' => 'awesome-cotton-tshirt',
                'description' => 'Super comfortable 100% organic cotton t-shirt. Be awesome, wear awesome!',
                'price' => 599.00,
                'sale_price' => 399.00,
                'stock' => 100,
                'is_active' => true,
                'rating' => 4.5,
                'total_reviews' => 45,
                'images' => json_encode(['https://via.placeholder.com/400x400/F59E0B/ffffff?text=T-Shirt']),
            ],
            [
                'merchant_id' => $creator->id,
                'category_id' => $fashion->id,
                'name' => 'Premium Leather Bag',
                'slug' => 'premium-leather-bag',
                'description' => 'Handcrafted genuine leather bag for the awesome professional.',
                'price' => 3999.00,
                'stock' => 20,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.9,
                'total_reviews' => 67,
                'images' => json_encode(['https://via.placeholder.com/400x400/7C3AED/ffffff?text=Leather+Bag']),
            ],
            [
                'merchant_id' => $creator->id,
                'category_id' => $home->id,
                'name' => 'Minimalist Desk Lamp',
                'slug' => 'minimalist-desk-lamp',
                'description' => 'Elegant LED desk lamp with adjustable brightness. Light up your awesome workspace!',
                'price' => 1299.00,
                'stock' => 40,
                'is_active' => true,
                'rating' => 4.4,
                'total_reviews' => 28,
                'images' => json_encode(['https://via.placeholder.com/400x400/EC4899/ffffff?text=Desk+Lamp']),
            ],
            [
                'merchant_id' => $creator->id,
                'category_id' => $electronics->id,
                'name' => 'Wireless Charging Pad',
                'slug' => 'wireless-charging-pad',
                'description' => 'Fast wireless charging for all your devices. Awesome technology!',
                'price' => 899.00,
                'sale_price' => 699.00,
                'stock' => 75,
                'is_active' => true,
                'rating' => 4.3,
                'total_reviews' => 156,
                'images' => json_encode(['https://via.placeholder.com/400x400/06B6D4/ffffff?text=Charger']),
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        echo "\n✅ Demo data created successfully!\n";
        echo "\nLogin Credentials:\n";
        echo "Customer: customer@demo.com / password\n";
        echo "Creator: creator@demo.com / password\n";
        echo "Admin: admin@demo.com / password\n\n";
    }
}