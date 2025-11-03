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
            $table->dateTime('available_from')->nullable()->after('is_active');
            $table->dateTime('available_to')->nullable()->after('available_from');
            $table->index(['available_from', 'available_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['available_from', 'available_to']);
            $table->dropColumn(['available_from', 'available_to']);
        });
    }
};
