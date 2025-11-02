import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Check,
  Clock,
  XCircle,
  Store,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  price: number
  quantity: number
  subtotal: number
  product?: {
    id: number
    slug: string
    images: string[]
  }
}

interface Order {
  id: number
  merchant_id: number
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  payment_method: string
  payment_status: string
  shipping_address: string | object
  notes: string
  tracking_number: string
  created_at: string
  updated_at: string
  merchant: {
    id: number
    business_name: string
    slug: string
    business_email: string
    business_phone: string
  }
  items: OrderItem[]
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

const orderStatuses = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
]

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.order || response.data)
    } catch (error: any) {
      console.error('Failed to fetch order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      setCancelling(true)
      await api.put(`/orders/${order.id}/cancel`)
      toast.success('Order cancelled successfully')
      fetchOrder() // Refresh order data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status)
  }

  const getStatusIndex = (status: string) => {
    return orderStatuses.findIndex((s) => s.key === status)
  }

  const parseAddress = (address: string | object) => {
    if (typeof address === 'string') {
      try {
        return JSON.parse(address)
      } catch {
        return { address }
      }
    }
    return address
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-20 w-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
            <Link to="/customer/orders">
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingAddress = parseAddress(order.shipping_address)
  const currentStatusIndex = getStatusIndex(order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/customer/orders"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {canCancelOrder(order.status) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                  {orderStatuses.map((status, index) => {
                    const Icon = status.icon
                    const isCompleted = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex

                    return (
                      <div key={status.key} className="relative flex items-start mb-8 last:mb-0">
                        <div
                          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p
                            className={`font-medium ${
                              isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {status.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-gray-600 mt-1">
                              Updated {new Date(order.updated_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.product_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">SKU: {item.product_sku}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shipping > 0 ? formatCurrency(order.shipping) : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Merchant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Merchant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/store/${order.merchant.slug}`}
                className="text-lg font-semibold text-primary hover:underline block mb-2"
              >
                {order.merchant.business_name}
              </Link>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{order.merchant.business_email}</p>
                <p>{order.merchant.business_phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {shippingAddress.name && <p className="font-medium">{shippingAddress.name}</p>}
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                {shippingAddress.city && shippingAddress.state && shippingAddress.zip && (
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                )}
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
                {shippingAddress.phone && <p className="mt-2">{shippingAddress.phone}</p>}
                {shippingAddress.email && <p>{shippingAddress.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method</span>
                  <span className="text-sm font-medium capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.tracking_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Tracking Number</p>
                <p className="font-mono font-semibold">{order.tracking_number}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
