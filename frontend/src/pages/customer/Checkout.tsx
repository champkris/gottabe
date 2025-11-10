import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping Information
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'United States',

    // Payment Information
    payment_method: 'paysolutions',
    card_number: '',
    card_name: '',
    card_expiry: '',
    card_cvv: '',

    // Additional
    notes: '',
  })

  const totalPrice = getTotalPrice()
  const shippingFee = 0 // Free shipping
  const tax = totalPrice * 0.08 // 8% tax
  const grandTotal = totalPrice + shippingFee + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Validate required fields
    if (!formData.shipping_name || !formData.shipping_email || !formData.shipping_phone ||
        !formData.shipping_address || !formData.shipping_city || !formData.shipping_state ||
        !formData.shipping_zip) {
      toast.error('Please fill in all shipping information')
      return
    }

    if (formData.payment_method === 'card') {
      if (!formData.card_number || !formData.card_name || !formData.card_expiry || !formData.card_cvv) {
        toast.error('Please fill in all payment information')
        return
      }
    }

    try {
      setLoading(true)

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          name: formData.shipping_name,
          email: formData.shipping_email,
          phone: formData.shipping_phone,
          address: formData.shipping_address,
          city: formData.shipping_city,
          state: formData.shipping_state,
          zip: formData.shipping_zip,
          country: formData.shipping_country,
        },
        payment_method: formData.payment_method,
        notes: formData.notes,
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        tax: tax,
        total: grandTotal,
      }

      const response = await api.post('/orders', orderData)
      const order = response.data.order

      // If PaySolutions payment, initiate payment gateway
      if (formData.payment_method === 'paysolutions') {
        try {
          const paymentResponse = await api.post('/payment/initiate', {
            order_id: order.id
          })

          if (paymentResponse.data.success && paymentResponse.data.payment_url) {
            toast.success('Redirecting to payment gateway...')
            // Redirect to PaySolutions payment page
            window.location.href = paymentResponse.data.payment_url
            return
          } else {
            throw new Error('Failed to initiate payment')
          }
        } catch (paymentError: any) {
          console.error('Payment initiation failed:', paymentError)
          toast.error('Payment initiation failed. Please try again.')
          navigate(`/customer/orders/${order.id}`)
          return
        }
      }

      toast.success('Order placed successfully!')
      clearCart()
      navigate(`/customer/orders/${order.id}`)
    } catch (error: any) {
      console.error('Failed to place order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 text-center mb-6">
              Add some items to your cart before checking out.
            </p>
            <Button onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      name="shipping_email"
                      value={formData.shipping_email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone *</label>
                    <Input
                      type="tel"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <Input
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      name="shipping_state"
                      value={formData.shipping_state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <Input
                      name="shipping_zip"
                      value={formData.shipping_zip}
                      onChange={handleInputChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <Input
                      name="shipping_country"
                      value={formData.shipping_country}
                      onChange={handleInputChange}
                      placeholder="United States"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Payment Information</h2>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Payment Method</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payment_method: 'paysolutions' }))}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.payment_method === 'paysolutions'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">PaySolutions</p>
                      <p className="text-xs text-gray-500 mt-1">Credit/Debit/QR</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payment_method: 'card' }))}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.payment_method === 'card'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Direct Card</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cod' }))}
                      className={`p-4 border-2 rounded-lg transition ${
                        formData.payment_method === 'cod'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Cash on Delivery</p>
                    </button>
                  </div>
                </div>

                {/* PaySolutions Info */}
                {formData.payment_method === 'paysolutions' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2 font-medium">
                      Secure Payment with PaySolutions
                    </p>
                    <p className="text-xs text-blue-700">
                      You will be redirected to PaySolutions secure payment page to complete your payment.
                      Supports credit cards, debit cards, and QR payment methods.
                    </p>
                  </div>
                )}

                {/* Card Details */}
                {formData.payment_method === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number *</label>
                      <Input
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                      <Input
                        name="card_name"
                        value={formData.card_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                        <Input
                          name="card_expiry"
                          value={formData.card_expiry}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV *</label>
                        <Input
                          name="card_cvv"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.payment_method === 'cod' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      You will pay in cash when your order is delivered to your address.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardContent className="p-6">
                <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>

                {/* Order Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
