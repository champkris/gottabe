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
        Schema::create('artworks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('file_path'); // Path to uploaded artwork file
            $table->string('file_type'); // png, jpg, svg, etc.
            $table->integer('width')->nullable(); // Image width in pixels
            $table->integer('height')->nullable(); // Image height in pixels
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('merchant_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
