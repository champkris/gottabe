<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Category;
use App\Models\Product;

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

        // Create Creator 1 - Gottabe Studio (50 THB per order commission)
        $creator1 = Merchant::create([
            'user_id' => $creator1User->id,
            'business_name' => 'Gottabe Studio',
            'slug' => 'gottabe-studio',
            'business_description' => 'Premium designs and collections for awesome people',
            'business_email' => 'studio@gottabe.com',
            'business_phone' => '555-123-4567',
            'business_address' => '789 Creative Plaza, Bangkok',
            'commission_amount' => 50.00,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create Creator 2 - TechVibe Designs (40 THB per order commission)
        $creator2 = Merchant::create([
            'user_id' => $creator2User->id,
            'business_name' => 'TechVibe Designs',
            'slug' => 'techvibe-designs',
            'business_description' => 'Modern tech-inspired designs for the digital age',
            'business_email' => 'hello@techvibe.com',
            'business_phone' => '555-234-5678',
            'business_address' => '456 Innovation Center, Bangkok',
            'commission_amount' => 40.00,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Create Creator 3 - Artistic Touch (60 THB per order commission)
        $creator3 = Merchant::create([
            'user_id' => $creator3User->id,
            'business_name' => 'Artistic Touch',
            'slug' => 'artistic-touch',
            'business_description' => 'Handcrafted artistic designs with a personal touch',
            'business_email' => 'contact@artistictouch.com',
            'business_phone' => '555-345-6789',
            'business_address' => '123 Gallery District, Bangkok',
            'commission_amount' => 60.00,
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

        // Create Products - Distributed among creators
        $products = [
            // Creator 1 - ToBeAwesome Studio (Electronics)
            [
                'merchant_id' => $creator1->id,
                'category_id' => $electronics->id,
                'name' => 'Awesome Wireless Headphones',
                'slug' => 'awesome-wireless-headphones',
                'description' => 'Premium noise-cancelling wireless headphones with 30-hour battery life. Experience crystal-clear audio and deep bass.',
                'price' => 2999.00,
                'sale_price' => 2499.00,
                'stock' => 50,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.5,
                'total_reviews' => 125,
                'images' => ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
            ],
            [
                'merchant_id' => $creator1->id,
                'category_id' => $electronics->id,
                'name' => 'Smart Watch Pro',
                'slug' => 'smart-watch-pro',
                'description' => 'Advanced fitness tracking, heart rate monitor, and smartphone notifications. Water-resistant design with AMOLED display.',
                'price' => 8999.00,
                'sale_price' => 7499.00,
                'stock' => 30,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.7,
                'total_reviews' => 89,
                'images' => ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
            ],

            // Creator 2 - TechVibe Designs (Electronics)
            [
                'merchant_id' => $creator2->id,
                'category_id' => $electronics->id,
                'name' => 'Wireless Bluetooth Speaker',
                'slug' => 'wireless-bluetooth-speaker',
                'description' => 'Portable waterproof speaker with 360-degree sound. Perfect for outdoor adventures.',
                'price' => 1499.00,
                'sale_price' => 1199.00,
                'stock' => 75,
                'is_active' => true,
                'rating' => 4.3,
                'total_reviews' => 54,
                'images' => ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
            ],
            [
                'merchant_id' => $creator2->id,
                'category_id' => $electronics->id,
                'name' => 'USB-C Fast Charger',
                'slug' => 'usb-c-fast-charger',
                'description' => 'Ultra-fast charging with multiple ports. Compatible with all devices.',
                'price' => 799.00,
                'sale_price' => 599.00,
                'stock' => 100,
                'is_active' => true,
                'rating' => 4.6,
                'total_reviews' => 78,
                'images' => ['https://images.unsplash.com/photo-1591290619762-d4b2b5a2b0c0?w=500'],
            ],

            // Creator 3 - Artistic Touch (Fashion & Home)
            [
                'merchant_id' => $creator3->id,
                'category_id' => $fashion->id,
                'name' => 'Premium Leather Bag',
                'slug' => 'premium-leather-bag',
                'description' => 'Handcrafted genuine leather messenger bag. Perfect for work or travel with multiple compartments.',
                'price' => 3999.00,
                'stock' => 25,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.8,
                'total_reviews' => 67,
                'images' => ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
            ],
            [
                'merchant_id' => $creator3->id,
                'category_id' => $fashion->id,
                'name' => 'Designer Sunglasses',
                'slug' => 'designer-sunglasses',
                'description' => 'UV400 protection polarized lenses. Stylish frame suitable for any occasion.',
                'price' => 899.00,
                'sale_price' => 699.00,
                'stock' => 100,
                'is_active' => true,
                'rating' => 4.4,
                'total_reviews' => 43,
                'images' => ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
            ],
            [
                'merchant_id' => $creator3->id,
                'category_id' => $homeAndLiving->id,
                'name' => 'Ceramic Plant Pot Set',
                'slug' => 'ceramic-plant-pot-set',
                'description' => 'Set of 3 minimalist ceramic pots perfect for succulents and small plants. Includes drainage holes.',
                'price' => 599.00,
                'stock' => 60,
                'is_active' => true,
                'rating' => 4.6,
                'total_reviews' => 38,
                'images' => ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'],
            ],
            [
                'merchant_id' => $creator3->id,
                'category_id' => $homeAndLiving->id,
                'name' => 'Handmade Wall Art',
                'slug' => 'handmade-wall-art',
                'description' => 'Original abstract canvas art. Adds personality to any room.',
                'price' => 2499.00,
                'stock' => 15,
                'is_featured' => true,
                'is_active' => true,
                'rating' => 4.9,
                'total_reviews' => 56,
                'images' => ['https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500'],
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }

        echo "\n✅ Database seeded successfully!\n";
        echo "📧 Demo accounts:\n";
        echo "   Customer: customer@demo.com / password\n";
        echo "   Creator: creator@demo.com / password\n";
        echo "   Admin: admin@demo.com / password\n\n";
    }
}
