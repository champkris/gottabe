import { useState, useEffect, useRef } from 'react'
import { Search, Filter, Package, ToggleLeft, ToggleRight, Star, Edit, Trash2, ImagePlus, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  category_id: number
  is_active: boolean
  is_featured: boolean
  available_from: string | null
  available_to: string | null
  category: {
    id: number
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
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editImages, setEditImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    category_id: '',
    is_active: true,
    is_featured: false,
    available_from: '',
    available_to: '',
  })
  const [useDateRange, setUseDateRange] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)

    // Format datetime for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateTime = (dateStr: string | null) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toISOString().slice(0, 16)
    }

    // Check if product has date range set
    const hasDateRange = !!(product.available_from || product.available_to)
    setUseDateRange(hasDateRange)

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      sale_price: product.sale_price?.toString() || '',
      stock: product.stock.toString(),
      category_id: product.category.id.toString(),
      is_active: product.is_active,
      is_featured: product.is_featured,
      available_from: formatDateTime(product.available_from),
      available_to: formatDateTime(product.available_to),
    })
    // Handle images - parse if string, use array if already array
    const productImages = typeof product.images === 'string'
      ? JSON.parse(product.images)
      : (product.images || [])
    setEditImages(productImages)
    setIsEditModalOpen(true)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    if (editImages.length === 0) {
      toast.error('Please add at least one product image')
      return
    }

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        images: editImages,
        available_from: useDateRange && formData.available_from ? formData.available_from : null,
        available_to: useDateRange && formData.available_to ? formData.available_to : null,
      }

      await api.put(`/admin/products/${editingProduct.id}`, updateData)
      toast.success('Product updated successfully')
      setIsEditModalOpen(false)
      setEditingProduct(null)
      setEditImages([])
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setEditImages([...editImages, url.trim()])
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await api.post('/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        return response.data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setEditImages([...editImages, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
    } catch (error: any) {
      console.error('Failed to upload images:', error)
      toast.error(error.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageRemove = (index: number) => {
    const newImages = editImages.filter((_, i) => i !== index)
    setEditImages(newImages)
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
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-700 hover:border-blue-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
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

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product description"
                    required
                  />
                </div>

                {/* Price and Sale Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Regular Price (฿)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sale Price (฿)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="0.00 (optional)"
                    />
                  </div>
                </div>

                {/* Stock and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Availability Date Range Toggle */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={useDateRange}
                      onChange={(e) => {
                        setUseDateRange(e.target.checked)
                        if (!e.target.checked) {
                          // Clear date values when disabled
                          setFormData({ ...formData, available_from: '', available_to: '' })
                        }
                      }}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium">Limit Availability by Date Range</span>
                      <p className="text-xs text-gray-500">Set specific dates when this product will be available for purchase</p>
                    </div>
                  </label>

                  {/* Date Range Inputs - Only show when enabled */}
                  {useDateRange && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium mb-2">Available From</label>
                        <Input
                          type="datetime-local"
                          value={formData.available_from}
                          onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                          placeholder="Select start date"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for no start date limit</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Available To</label>
                        <Input
                          type="datetime-local"
                          value={formData.available_to}
                          onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                          placeholder="Select end date"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for no end date limit</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Images</label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload images or add via URL. First image will be the main product image.
                  </p>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {editImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Upload Image Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {uploadingImage ? 'Uploading...' : 'Upload'}
                      </span>
                    </button>

                    {/* Add URL Button */}
                    <button
                      type="button"
                      onClick={handleImageUrlAdd}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition"
                    >
                      <ImagePlus className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-600">Add URL</span>
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {editImages.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">At least one image is required</p>
                  )}
                </div>

                {/* Status Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Update Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
