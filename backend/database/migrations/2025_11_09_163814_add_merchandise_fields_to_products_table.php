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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('merchandise_type_id')->nullable()->after('category_id')->constrained()->onDelete('set null');
            $table->foreignId('artwork_id')->nullable()->after('merchandise_type_id')->constrained()->onDelete('set null');
            $table->foreignId('placement_option_id')->nullable()->after('artwork_id')->constrained()->onDelete('set null');
            $table->string('size')->nullable()->after('placement_option_id'); // S, M, L, XL, etc.
            $table->string('color')->nullable()->after('size'); // white, black, red, etc.
            $table->string('mockup_image')->nullable()->after('images'); // Generated mockup image path
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['merchandise_type_id']);
            $table->dropForeign(['artwork_id']);
            $table->dropForeign(['placement_option_id']);
            $table->dropColumn(['merchandise_type_id', 'artwork_id', 'placement_option_id', 'size', 'color', 'mockup_image']);
        });
    }
};
