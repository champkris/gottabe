import { useState, useEffect } from 'react'
import {
  Users,
  Store,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Creator {
  id: number
  business_name: string
  slug: string
  business_email: string
  business_phone: string
  commission_amount: number
  is_approved: boolean
  approved_at: string | null
  created_at: string
  user: {
    id: number
    name: string
    email: string
    role: string
  }
  total_products: number
  active_products: number
  total_sales: number
  total_orders: number
  commission_earned?: number
}

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [editingCommission, setEditingCommission] = useState<number | null>(null)
  const [commissionAmount, setCommissionAmount] = useState<string>('')

  useEffect(() => {
    fetchCreators()
  }, [statusFilter])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const response = await api.get(`/admin/creators?${params.toString()}`)
      setCreators(response.data.data || response.data)
    } catch (error: any) {
      console.error('Failed to fetch creators:', error)
      toast.error('Failed to load creators')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/admin/creators/${id}/approve`)
      toast.success('Creator approved successfully')
      fetchCreators()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve creator')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await api.put(`/admin/creators/${id}/reject`)
      toast.success('Creator account suspended')
      fetchCreators()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to suspend creator')
    }
  }

  const handleUpdateCommission = async (id: number) => {
    try {
      const amount = parseFloat(commissionAmount)
      if (isNaN(amount) || amount < 0) {
        toast.error('Commission amount must be 0 or greater')
        return
      }
      await api.put(`/admin/creators/${id}/commission`, { commission_amount: amount })
      toast.success('Commission amount updated successfully')
      setEditingCommission(null)
      fetchCreators()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update commission amount')
    }
  }

  const handleDelete = async (id: number, businessName: string) => {
    if (!confirm(`Are you sure you want to delete ${businessName}? This action cannot be undone.`)) {
      return
    }
    try {
      await api.delete(`/admin/creators/${id}`)
      toast.success('Creator deleted successfully')
      fetchCreators()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete creator')
    }
  }

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: creators.length,
    approved: creators.filter((c) => c.is_approved).length,
    pending: creators.filter((c) => !c.is_approved).length,
    totalSales: creators.reduce((sum, c) => sum + c.total_sales, 0),
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creators...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Creators</h1>
        <p className="text-gray-600">
          Manage creator accounts, configure commission amounts, and monitor performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Creators</p>
                <h3 className="text-2xl font-bold mb-1">{stats.total}</h3>
                <p className="text-xs text-gray-500">All registered</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <h3 className="text-2xl font-bold mb-1">{stats.approved}</h3>
                <p className="text-xs text-gray-500">Active creators</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <h3 className="text-2xl font-bold mb-1">{stats.pending}</h3>
                <p className="text-xs text-gray-500">Need approval</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <h3 className="text-2xl font-bold mb-1">{formatCurrency(stats.totalSales)}</h3>
                <p className="text-xs text-gray-500">All creators</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creators List */}
      <Card>
        <CardHeader>
          <CardTitle>Creators ({filteredCreators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCreators.length > 0 ? (
            <div className="space-y-4">
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{creator.business_name}</h3>
                          {creator.is_approved ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{creator.user.name}</p>
                        <p className="text-sm text-gray-500">{creator.user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(creator.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!creator.is_approved ? (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(creator.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(creator.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(creator.id, creator.business_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Products</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        {creator.total_products}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active</p>
                      <p className="text-sm font-semibold text-green-600">
                        {creator.active_products}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                      <p className="text-sm font-semibold">{creator.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(creator.total_sales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Commission Earned</p>
                      <p className="text-sm font-semibold text-purple-600">
                        {formatCurrency(creator.commission_amount * creator.total_orders)}
                      </p>
                    </div>
                  </div>

                  {/* Commission Amount Editor */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Commission per Order:</span>
                    </div>

                    {editingCommission === creator.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={commissionAmount}
                          onChange={(e) => setCommissionAmount(e.target.value)}
                          className="w-32"
                          placeholder="Amount in THB"
                        />
                        <span className="text-sm">THB</span>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateCommission(creator.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCommission(null)
                            setCommissionAmount('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(creator.commission_amount)}
                        </span>
                        <span className="text-sm text-gray-500">per order</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCommission(creator.id)
                            setCommissionAmount(creator.commission_amount.toString())
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No creators found</p>
              <p className="text-sm">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No creators have registered yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
