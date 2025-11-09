<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'category_id',
        'merchandise_type_id',
        'artwork_id',
        'placement_option_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'sale_price',
        'cost',
        'sku',
        'barcode',
        'stock',
        'min_stock',
        'size',
        'color',
        'images',
        'mockup_image',
        'attributes',
        'tags',
        'weight',
        'dimensions',
        'is_featured',
        'is_digital',
        'is_active',
        'available_from',
        'available_to',
        'rating',
        'total_reviews',
        'total_sales',
        'views',
    ];

    protected $casts = [
        'images' => 'array',
        'attributes' => 'array',
        'tags' => 'array',
        'dimensions' => 'array',
        'is_featured' => 'boolean',
        'is_digital' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost' => 'decimal:2',
        'weight' => 'decimal:2',
        'rating' => 'decimal:2',
        'available_from' => 'datetime',
        'available_to' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);

                // Ensure unique slug
                $originalSlug = $product->slug;
                $count = 1;
                while (static::where('slug', $product->slug)->exists()) {
                    $product->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }

            // Generate SKU if not provided
            if (empty($product->sku)) {
                $product->sku = 'PRD-' . strtoupper(Str::random(8));
            }
        });
    }

    /**
     * Get the merchant that owns the product.
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Get the category of the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the merchandise type of the product.
     */
    public function merchandiseType(): BelongsTo
    {
        return $this->belongsTo(MerchandiseType::class);
    }

    /**
     * Get the artwork used in the product.
     */
    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }

    /**
     * Get the placement option of the product.
     */
    public function placementOption(): BelongsTo
    {
        return $this->belongsTo(PlacementOption::class);
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get approved reviews for the product.
     */
    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('is_approved', true);
    }

    /**
     * Get the current price (sale price if available, otherwise regular price).
     */
    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Get the discount percentage.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->sale_price || $this->sale_price >= $this->price) {
            return null;
        }

        return round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    /**
     * Check if product is in stock.
     */
    public function getIsInStockAttribute(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Check if product is low in stock.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->stock > 0 && $this->stock <= $this->min_stock;
    }

    /**
     * Get the main image URL.
     */
    public function getMainImageAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    /**
     * Check if product is currently available based on date range.
     */
    public function getIsAvailableAttribute(): bool
    {
        $now = now();

        // If no dates are set, product is always available
        if (!$this->available_from && !$this->available_to) {
            return true;
        }

        // If only available_from is set
        if ($this->available_from && !$this->available_to) {
            return $now->greaterThanOrEqualTo($this->available_from);
        }

        // If only available_to is set
        if (!$this->available_from && $this->available_to) {
            return $now->lessThanOrEqualTo($this->available_to);
        }

        // If both dates are set
        return $now->greaterThanOrEqualTo($this->available_from) &&
               $now->lessThanOrEqualTo($this->available_to);
    }

    /**
     * Scope for active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope for available products based on date range.
     */
    public function scopeAvailable($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->where(function ($query) use ($now) {
                // Both dates are set
                $query->whereNotNull('available_from')
                      ->whereNotNull('available_to')
                      ->where('available_from', '<=', $now)
                      ->where('available_to', '>=', $now);
            })->orWhere(function ($query) use ($now) {
                // Only available_from is set
                $query->whereNotNull('available_from')
                      ->whereNull('available_to')
                      ->where('available_from', '<=', $now);
            })->orWhere(function ($query) use ($now) {
                // Only available_to is set
                $query->whereNull('available_from')
                      ->whereNotNull('available_to')
                      ->where('available_to', '>=', $now);
            })->orWhere(function ($query) {
                // Neither date is set (always available)
                $query->whereNull('available_from')
                      ->whereNull('available_to');
            });
        });
    }

    /**
     * Update product rating based on reviews.
     */
    public function updateRating(): void
    {
        $avgRating = $this->approvedReviews()->avg('rating') ?? 0;
        $totalReviews = $this->approvedReviews()->count();

        $this->update([
            'rating' => round($avgRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }
}