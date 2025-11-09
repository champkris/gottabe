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
        Schema::create('merchandise_placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchandise_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('placement_option_id')->constrained()->onDelete('cascade');
            $table->decimal('price_modifier', 10, 2)->default(0); // Additional cost for this placement
            $table->timestamps();

            $table->unique(['merchandise_type_id', 'placement_option_id'], 'merch_placement_unique');
            $table->index('merchandise_type_id');
            $table->index('placement_option_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchandise_placements');
    }
};
