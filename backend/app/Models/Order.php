<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'merchant_id',
        'status',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
        'commission_rate',
        'commission_amount',
        'merchant_payout',
        'payment_method',
        'payment_status',
        'payment_details',
        'shipping_address',
        'billing_address',
        'shipping_method',
        'tracking_number',
        'notes',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'payment_details' => 'array',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'merchant_payout' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            // Generate unique order number
            $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());
        });
    }

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the merchant that owns the order.
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Calculate order totals.
     */
    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('subtotal');
        $total = $subtotal + $this->tax + $this->shipping - $this->discount;

        // Calculate commission
        $commissionAmount = $total * ($this->commission_rate / 100);
        $merchantPayout = $total - $commissionAmount;

        $this->update([
            'subtotal' => $subtotal,
            'total' => $total,
            'commission_amount' => round($commissionAmount, 2),
            'merchant_payout' => round($merchantPayout, 2),
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(string $status): void
    {
        $this->status = $status;

        // Set timestamps based on status
        if ($status === 'shipped' && !$this->shipped_at) {
            $this->shipped_at = now();
        } elseif ($status === 'delivered' && !$this->delivered_at) {
            $this->delivered_at = now();
            if (!$this->shipped_at) {
                $this->shipped_at = now();
            }
        }

        $this->save();
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    /**
     * Check if order can be refunded.
     */
    public function canBeRefunded(): bool
    {
        return $this->status === 'delivered' && $this->payment_status === 'paid';
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'processing' => 'blue',
            'shipped' => 'purple',
            'delivered' => 'green',
            'cancelled' => 'red',
            'refunded' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get payment status color for UI.
     */
    public function getPaymentStatusColorAttribute(): string
    {
        return match($this->payment_status) {
            'pending' => 'yellow',
            'paid' => 'green',
            'failed' => 'red',
            'refunded' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Scope for paid orders.
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope for delivered orders.
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }
}