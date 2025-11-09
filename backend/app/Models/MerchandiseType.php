<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MerchandiseType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'base_price',
        'template_image',
        'sizes',
        'colors',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
        'is_active' => 'boolean',
        'base_price' => 'decimal:2',
    ];

    /**
     * Get the placement options available for this merchandise type
     */
    public function placementOptions(): BelongsToMany
    {
        return $this->belongsToMany(PlacementOption::class, 'merchandise_placements')
            ->withPivot('price_modifier')
            ->withTimestamps();
    }

    /**
     * Get all products of this merchandise type
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
