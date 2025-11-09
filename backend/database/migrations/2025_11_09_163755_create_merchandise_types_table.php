<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('merchandise_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // T-Shirt, Cup, Hoodie, etc.
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2)->default(0); // Base price for this merchandise
            $table->string('template_image')->nullable(); // Template image for mockup generation
            $table->json('sizes')->nullable(); // Available sizes: ["S", "M", "L", "XL"]
            $table->json('colors')->nullable(); // Available colors: ["white", "black", "red"]
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchandise_types');
    }
};
