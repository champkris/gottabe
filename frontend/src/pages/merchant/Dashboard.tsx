import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Percent,
  Eye,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface DashboardData {
  total_sales: number
  commission_amount: number
  commission_earned: number
  total_units_sold: number
  total_revenue: number
  total_orders: number
  total_products: number
  active_products: number
  current_month_sales: number
  last_month_sales: number
  sales_growth: number
  best_selling_products: Array<{
    id: number
    name: string
    price: number
    units_sold: number
    revenue: number
    commission: number
    category: {
      name: string
    }
    images: string[]
  }>
  sales_chart: Array<{
    date: string
    sales: number
    orders: number
  }>
  creator: {
    business_name: string
    commission_amount: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/creator/dashboard')
      setData(response.data)
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(data?.total_sales || 0),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time revenue',
    },
    {
      title: 'Commission Earned',
      value: formatCurrency(data?.commission_earned || 0),
      icon: Percent,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `฿${data?.commission_amount || 0} per piece`,
    },
    {
      title: 'Total Orders',
      value: data?.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Products sold',
    },
    {
      title: 'Active Products',
      value: `${data?.active_products || 0}/${data?.total_products || 0}`,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Live listings',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {data?.creator.business_name}! Here's your performance overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">This Month</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(data?.current_month_sales || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Last Month</p>
              <p className="text-2xl font-bold text-gray-700">
                {formatCurrency(data?.last_month_sales || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Growth</p>
              <p
                className={`text-2xl font-bold ${
                  (data?.sales_growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(data?.sales_growth || 0) >= 0 ? '+' : ''}
                {data?.sales_growth || 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Best Selling Products</CardTitle>
              <Link to="/creator/products">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data?.best_selling_products && data.best_selling_products.length > 0 ? (
              <div className="space-y-4">
                {data.best_selling_products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={
                            typeof product.images === 'string'
                              ? JSON.parse(product.images)[0]
                              : product.images[0]
                          }
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {product.category?.name || 'Uncategorized'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{product.units_sold} units sold</span>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {formatCurrency(product.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Your Commission</p>
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrency(product.commission)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No sales yet</p>
                <p className="text-sm">Start creating and promoting your products!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/creator/products/new">
                <Button className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link to="/creator/products">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Products
                </Button>
              </Link>
              <Link to="/creator/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Commission Info */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Commission Per Piece
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ฿{data?.commission_amount || 0}
                </p>
                <p className="text-sm text-gray-600">
                  You earn ฿{data?.commission_amount || 0} for every piece sold
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data?.commission_earned || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From {data?.total_units_sold || 0} pieces sold
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600" />
                Creator Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                <p className="text-gray-700">
                  Create unique, high-quality product designs
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                <p className="text-gray-700">
                  Use clear, attractive product images
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                <p className="text-gray-700">
                  Write detailed product descriptions
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                <p className="text-gray-700">
                  Monitor your best sellers and trends
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
