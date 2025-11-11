import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '@/lib/axios'

export default function PaymentReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')

  useEffect(() => {
    const updateOrderStatus = async () => {
      // Get all query params
      const allParams = Object.fromEntries(searchParams.entries())

      // Log for debugging
      console.log('=== Payment Return Debug ===')
      console.log('All URL params:', allParams)
      console.log('===========================')

      // Get payment status from query params
      const refNo = searchParams.get('refno')
      const paymentStatus = searchParams.get('status')
      const orderId = searchParams.get('order_id')

      // Check multiple possible status parameter names
      const statusParams = [
        searchParams.get('status'),
        searchParams.get('result'),
        searchParams.get('payment_status'),
        searchParams.get('apCode'),
        searchParams.get('respcode'),
      ]

      // Determine status based on query params
      // PaySolutions may return different parameters
      const hasAnyParam = Object.keys(allParams).length > 0
      const successIndicators = ['success', '00', '0', 'approved', 'completed']
      const failIndicators = ['failed', 'error', 'declined', 'rejected']

      let foundStatus = 'processing'

      for (const statusParam of statusParams) {
        if (statusParam) {
          const lowerStatus = statusParam.toLowerCase()
          if (successIndicators.some(indicator => lowerStatus.includes(indicator))) {
            foundStatus = 'success'
            break
          } else if (failIndicators.some(indicator => lowerStatus.includes(indicator))) {
            foundStatus = 'failed'
            break
          }
        }
      }

      // If we have params but no clear status, assume success for now
      // (user returned from payment page)
      if (hasAnyParam && foundStatus === 'processing') {
        foundStatus = 'success'
      }

      // Update order status via API if we have refNo
      if (refNo && foundStatus === 'success') {
        try {
          // Extract order ID from refNo (remove leading zeros)
          const extractedOrderId = parseInt(refNo, 10)

          console.log('Updating order status for order:', extractedOrderId)

          // Call backend to update order status
          const response = await api.post('/payment/callback', {
            refno: refNo,
            status: 'success',
            source: 'return_page'
          })

          console.log('Order status updated:', response.data)
        } catch (error) {
          console.error('Failed to update order status:', error)
          // Don't change status, just log the error
        }
      }

      setStatus(foundStatus)
    }

    updateOrderStatus()
  }, [searchParams])

  const handleViewOrder = () => {
    const refNo = searchParams.get('refno')
    const orderId = searchParams.get('order_id')

    // Try to extract order ID from refNo if order_id not provided
    // refNo is 12-digit padded, so we need to remove leading zeros
    const orderIdFromRef = refNo ? parseInt(refNo, 10) : null

    if (orderId) {
      navigate(`/customer/orders/${orderId}`)
    } else if (orderIdFromRef) {
      navigate(`/customer/orders/${orderIdFromRef}`)
    } else {
      navigate('/customer/orders')
    }
  }

  const handleBackToShop = () => {
    navigate('/shop')
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-600 text-center mb-6">
                Your payment is being processed. Please wait...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 text-center mb-6">
                Thank you for your payment. Your order has been confirmed.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleViewOrder}>
                  View Order
                </Button>
                <Button variant="outline" onClick={handleBackToShop}>
                  Continue Shopping
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-gray-600 text-center mb-6">
                There was an issue processing your payment. Please try again or contact support.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleViewOrder}>
                  View Order
                </Button>
                <Button variant="outline" onClick={handleBackToShop}>
                  Back to Shop
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
