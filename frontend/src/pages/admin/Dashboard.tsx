import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Folder,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface DashboardData {
  overview: {
    total_users: number
    total_customers: number
    total_creators: number
    total_products: number
    total_orders: number
    total_categories: number
  }
  revenue: {
    total_revenue: number
    total_commission: number
    platform_revenue: number
    current_month: number
    last_month: number
    growth: number
  }
  orders: {
    current_month: number
    last_month: number
    growth: number
    by_status: Record<string, number>
  }
  recent_orders: Array<{
    id: number
    total: number
    status: string
    created_at: string
    user: {
      name: string
    }
    merchant: {
      business_name: string
    }
  }>
  top_creators: Array<{
    id: number
    business_name: string
    total_sales: number
    commission: number
    commission_rate: number
    user: {
      name: string
      email: string
    }
  }>
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
      const response = await api.get('/admin/dashboard')
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
      title: 'Total Revenue',
      value: formatCurrency(data?.revenue.total_revenue || 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'All time',
    },
    {
      title: 'Total Orders',
      value: data?.overview.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time',
    },
    {
      title: 'Total Products',
      value: data?.overview.total_products || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Listed',
    },
    {
      title: 'Total Users',
      value: data?.overview.total_users || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: `${data?.overview.total_creators || 0} creators`,
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and key metrics</p>
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

      {/* Revenue & Orders Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data?.revenue.current_month || 0)}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    (data?.revenue.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {(data?.revenue.growth || 0) >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span className="text-xl font-bold">{data?.revenue.growth || 0}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Platform Revenue</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(data?.revenue.platform_revenue || 0)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Creator Commission</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(data?.revenue.total_commission || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data?.orders.current_month || 0} orders
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    (data?.orders.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {(data?.orders.growth || 0) >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span className="text-xl font-bold">{data?.orders.growth || 0}%</span>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(data?.orders.by_status || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/admin/orders">
                <button className="text-sm text-primary hover:underline">View All</button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recent_orders && data.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {data.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(order.total)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Creators */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Creators</CardTitle>
              <Link to="/admin/creators">
                <button className="text-sm text-primary hover:underline">View All</button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data?.top_creators && data.top_creators.length > 0 ? (
              <div className="space-y-3">
                {data.top_creators.map((creator, index) => (
                  <div key={creator.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{creator.business_name}</p>
                      <p className="text-sm text-gray-600">{creator.user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(creator.total_sales)}</p>
                      <p className="text-xs text-gray-500">{creator.commission_rate}% commission</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No creators yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{data?.overview.total_customers || 0}</p>
            <p className="text-sm text-gray-600">Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{data?.overview.total_creators || 0}</p>
            <p className="text-sm text-gray-600">Creators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{data?.overview.total_products || 0}</p>
            <p className="text-sm text-gray-600">Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Folder className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">{data?.overview.total_categories || 0}</p>
            <p className="text-sm text-gray-600">Categories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
