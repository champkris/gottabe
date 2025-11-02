import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  ImagePlus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
}

interface ProductFormData {
  name: string
  sku: string
  description: string
  price: number
  sale_price: number | null
  stock: number
  category_id: number
  is_active: boolean
  images: string[]
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      is_active: true,
      sale_price: null,
    },
  })

  useEffect(() => {
    fetchCategories()
    if (isEditMode) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/merchant/products/${id}`)
      const product = response.data.product || response.data
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        stock: product.stock,
        category_id: product.category_id,
        is_active: product.is_active,
      })
      setImages(product.images || [])
      setImageUrls(product.images || [])
    } catch (error: any) {
      console.error('Failed to fetch product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:')
    if (url && url.trim()) {
      setImages([...images, url.trim()])
      setImageUrls([...imageUrls, url.trim()])
    }
  }

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImages(newImages)
    setImageUrls(newUrls)
  }

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('Please add at least one product image')
      return
    }

    try {
      setLoading(true)
      const productData = {
        ...data,
        images: images,
        sale_price: data.sale_price || null,
      }

      if (isEditMode) {
        await api.put(`/merchant/products/${id}`, productData)
        toast.success('Product updated successfully')
      } else {
        await api.post('/merchant/products', productData)
        toast.success('Product created successfully')
      }

      navigate('/merchant/products')
    } catch (error: any) {
      console.error('Failed to save product:', error)
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/merchant/products"
          className="inline-flex items-center text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update product information' : 'Create a new product listing'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    className={errors.name ? 'border-red-500' : ''}
                    {...register('name', {
                      required: 'Product name is required',
                      minLength: {
                        value: 3,
                        message: 'Product name must be at least 3 characters',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-medium">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <Input
                    id="sku"
                    placeholder="e.g., WBH-001"
                    className={errors.sku ? 'border-red-500' : ''}
                    {...register('sku', {
                      required: 'SKU is required',
                    })}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Describe your product in detail..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    {...register('description', {
                      required: 'Description is required',
                      minLength: {
                        value: 20,
                        message: 'Description must be at least 20 characters',
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category_id" className="text-sm font-medium">
                    Category *
                  </label>
                  <select
                    id="category_id"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.category_id ? 'border-red-500' : ''
                    }`}
                    {...register('category_id', {
                      required: 'Category is required',
                      valueAsNumber: true,
                    })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Regular Price */}
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Regular Price (THB) *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                      {...register('price', {
                        required: 'Price is required',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Price must be greater than 0',
                        },
                      })}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Sale Price */}
                  <div className="space-y-2">
                    <label htmlFor="sale_price" className="text-sm font-medium">
                      Sale Price (THB)
                      <span className="text-gray-500 text-xs ml-1">(optional)</span>
                    </label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register('sale_price', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-medium">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      className={errors.stock ? 'border-red-500' : ''}
                      {...register('stock', {
                        required: 'Stock quantity is required',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Stock cannot be negative',
                        },
                      })}
                    />
                    {errors.stock && (
                      <p className="text-sm text-red-500">{errors.stock.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add images by providing URLs. First image will be the main product image.
                </p>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
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
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Image Button */}
                  <button
                    type="button"
                    onClick={handleImageUrlAdd}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition"
                  >
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Add Image</span>
                  </button>
                </div>

                {images.length === 0 && (
                  <p className="text-sm text-red-500">At least one image is required</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    {...register('is_active')}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active (visible to customers)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Inactive products won't be shown in the store
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                </Button>
                <Link to="/merchant/products" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Use clear, descriptive product names</p>
                <p>• Add high-quality images (recommended: 800x800px)</p>
                <p>• Write detailed descriptions with key features</p>
                <p>• Keep your inventory up to date</p>
                <p>• Use sale prices for promotions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
