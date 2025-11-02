import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, getItemsByMerchant } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const merchantGroups = getItemsByMerchant()

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemove = (productId: number) => {
    removeItem(productId)
  }

  const handleCheckout = () => {
    navigate('/customer/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 text-center mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/shop">
              <Button>
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Group items by merchant */}
              {Array.from(merchantGroups.entries()).map(([merchantId, merchantItems]) => (
                <div key={merchantId} className="mb-8 last:mb-0">
                  {/* Merchant Header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">
                      {merchantItems[0]?.name && 'Sold by'} {/* Merchant name would come from the item */}
                    </h3>
                  </div>

                  {/* Items from this merchant */}
                  <div className="space-y-4">
                    {merchantItems.map((item) => (
                      <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-product.png'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1 line-clamp-2">{item.name}</h4>
                          <p className="text-lg font-bold text-primary mb-2">
                            {formatCurrency(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-1.5 min-w-[50px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {item.stock <= 5 && (
                              <span className="text-xs text-orange-600">
                                Only {item.stock} left
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(item.productId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <p className="text-xl font-bold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-4">
            <Link to="/shop">
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full mb-3"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Free delivery for orders over $50</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Secure payment with SSL encryption</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>30-day return policy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
