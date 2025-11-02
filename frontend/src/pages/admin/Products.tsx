import { useState, useEffect } from 'react'
import { Search, Filter, Package, ToggleLeft, ToggleRight, Star, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  is_active: boolean
  is_featured: boolean
  category: {
    name: string
  }
  merchant: {
    business_name: string
    user: {
      name: string
    }
  }
  images: string[]
}

interface PaginatedProducts {
  data: Product[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function Products() {
  const [products, setProducts] = useState<PaginatedProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [currentPage, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        per_page: 20,
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (search) {
        params.search = search
      }
      const response = await api.get('/admin/products', { params })
      setProducts(response.data)
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await api.post(`/admin/products/${id}/toggle-status`)
      toast.success('Product status updated')
      fetchProducts()
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleToggleFeatured = async (id: number) => {
    try {
      await api.post(`/admin/products/${id}/toggle-featured`)
      toast.success('Product featured status updated')
      fetchProducts()
    } catch (error: any) {
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'featured', label: 'Featured' },
  ]

  if (loading && !products) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600">Manage all platform products</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.data.map((product) => (
          <Card key={product.id} className={!product.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                {/* Status badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {product.is_featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                      <Star className="h-3 w-3 inline" />
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
                <p className="text-xs text-gray-500 mb-3">By: {product.merchant.business_name}</p>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.sale_price || product.price)}
                  </span>
                  {product.sale_price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">Stock: {product.stock}</p>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleStatus(product.id)}
                    >
                      {product.is_active ? (
                        <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 mr-1" />
                      )}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(product.id)}
                      className={product.is_featured ? 'text-yellow-600 border-yellow-600' : ''}
                    >
                      <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products && products.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-2">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {products && products.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * products.per_page + 1} to{' '}
            {Math.min(currentPage * products.per_page, products.total)} of {products.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === products.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
