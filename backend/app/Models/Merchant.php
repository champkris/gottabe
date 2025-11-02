<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Merchant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'slug',
        'business_description',
        'business_email',
        'business_phone',
        'business_address',
        'logo',
        'banner',
        'commission_rate',
        'is_approved',
        'approved_at',
        'business_hours',
        'social_links',
        'rating',
        'total_reviews',
        'total_sales',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
        'business_hours' => 'array',
        'social_links' => 'array',
        'commission_rate' => 'decimal:2',
        'rating' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($merchant) {
            if (empty($merchant->slug)) {
                $merchant->slug = Str::slug($merchant->business_name);

                // Ensure unique slug
                $originalSlug = $merchant->slug;
                $count = 1;
                while (static::where('slug', $merchant->slug)->exists()) {
                    $merchant->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });
    }

    /**
     * Get the user that owns the merchant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the products for the merchant.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the orders for the merchant.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get active products for the merchant.
     */
    public function activeProducts(): HasMany
    {
        return $this->products()->where('is_active', true);
    }

    /**
     * Get total revenue for the merchant.
     */
    public function getTotalRevenueAttribute(): float
    {
        return $this->orders()
            ->whereIn('status', ['delivered'])
            ->sum('merchant_payout');
    }

    /**
     * Get pending orders count.
     */
    public function getPendingOrdersCountAttribute(): int
    {
        return $this->orders()
            ->where('status', 'pending')
            ->count();
    }

    /**
     * Calculate commission for an amount.
     */
    public function calculateCommission(float $amount): array
    {
        $commission = $amount * ($this->commission_rate / 100);
        $payout = $amount - $commission;

        return [
            'commission' => round($commission, 2),
            'payout' => round($payout, 2),
        ];
    }
}