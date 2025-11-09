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
        Schema::table('merchants', function (Blueprint $table) {
            $table->renameColumn('commission_rate', 'commission_amount');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('commission_rate', 'commission_amount_per_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->renameColumn('commission_amount', 'commission_rate');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('commission_amount_per_order', 'commission_rate');
        });
    }
};
