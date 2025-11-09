<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlacementOption extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'position_coordinates',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'position_coordinates' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the merchandise types that have this placement option
     */
    public function merchandiseTypes(): BelongsToMany
    {
        return $this->belongsToMany(MerchandiseType::class, 'merchandise_placements')
            ->withPivot('price_modifier')
            ->withTimestamps();
    }

    /**
     * Get all products using this placement
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
