import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  DollarSign,
  Archive,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  images: string[]
  is_active: boolean
  category: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('all')
  const [showMenu, setShowMenu] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/merchant/products')
      setProducts(response.data.data || response.data)
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      await api.put(`/merchant/products/${productId}`, {
        is_active: !currentStatus,
      })
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchProducts()
      setShowMenu(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product status')
    }
  }

  const handleDelete = async (productId: number, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/merchant/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
      setShowMenu(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && product.is_active) ||
      (filter === 'inactive' && !product.is_active) ||
      (filter === 'low_stock' && product.stock < 10)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    inactive: products.filter((p) => !p.is_active).length,
    lowStock: products.filter((p) => p.stock < 10).length,
  }

  if (loading) {
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Products</h1>
          <p className="text-gray-600">Manage your product listings</p>
        </div>
        <Link to="/merchant/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Products</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Low Stock</div>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'inactive'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive ({stats.inactive})
          </button>
          <button
            onClick={() => setFilter('low_stock')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'low_stock'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock ({stats.lowStock})
          </button>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-20 w-20 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filter !== 'all' ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first product'}
            </p>
            {!searchQuery && filter === 'all' && (
              <Link to="/merchant/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {product.stock < 10 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(showMenu === product.id ? null : product.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>

                        {showMenu === product.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <Link
                              to={`/merchant/products/${product.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                              onClick={() => setShowMenu(null)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(product.id, product.is_active)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              {product.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-wrap items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          {product.sale_price ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">
                                {formatCurrency(product.sale_price)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold">{formatCurrency(product.price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Stock:{' '}
                          <span
                            className={`font-medium ${
                              product.stock < 10 ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Category: <span className="font-medium">{product.category.name}</span>
                      </div>

                      <div className="text-sm text-gray-500">
                        Updated {new Date(product.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(null)}
        ></div>
      )}
    </div>
  )
}
