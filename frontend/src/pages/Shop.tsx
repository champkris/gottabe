import { useState, useEffect } from 'react'
import { ChevronDown, Filter, Grid3X3, List, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ProductCard from '@/components/ProductCard'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

// Mock products for now
const mockProducts = [
  {
    id: 1,
    name: 'Awesome Wireless Headphones',
    slug: 'awesome-wireless-headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life.',
    price: 2999.00,
    sale_price: 2499.00,
    images: ['https://via.placeholder.com/400x400/4F46E5/ffffff?text=Headphones'],
    stock: 50,
    rating: 4.8,
    total_reviews: 125,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Track your fitness and stay connected with this awesome smartwatch.',
    price: 8999.00,
    sale_price: 7499.00,
    images: ['https://via.placeholder.com/400x400/10B981/ffffff?text=SmartWatch'],
    stock: 30,
    rating: 4.6,
    total_reviews: 89,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }
  },
  {
    id: 3,
    name: 'Premium Leather Bag',
    slug: 'premium-leather-bag',
    description: 'Handcrafted genuine leather bag for the awesome professional.',
    price: 3999.00,
    images: ['https://via.placeholder.com/400x400/7C3AED/ffffff?text=Leather+Bag'],
    stock: 20,
    rating: 4.9,
    total_reviews: 67,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 2,
      name: 'Fashion',
      slug: 'fashion'
    }
  },
  {
    id: 4,
    name: 'Awesome Cotton T-Shirt',
    slug: 'awesome-cotton-tshirt',
    description: 'Super comfortable 100% organic cotton t-shirt.',
    price: 599.00,
    sale_price: 399.00,
    images: ['https://via.placeholder.com/400x400/F59E0B/ffffff?text=T-Shirt'],
    stock: 100,
    rating: 4.5,
    total_reviews: 45,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 2,
      name: 'Fashion',
      slug: 'fashion'
    }
  },
  {
    id: 5,
    name: 'Minimalist Desk Lamp',
    slug: 'minimalist-desk-lamp',
    description: 'Elegant LED desk lamp with adjustable brightness.',
    price: 1299.00,
    images: ['https://via.placeholder.com/400x400/EC4899/ffffff?text=Desk+Lamp'],
    stock: 40,
    rating: 4.4,
    total_reviews: 28,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 3,
      name: 'Home & Living',
      slug: 'home-living'
    }
  },
  {
    id: 6,
    name: 'Wireless Charging Pad',
    slug: 'wireless-charging-pad',
    description: 'Fast wireless charging for all your devices.',
    price: 899.00,
    sale_price: 699.00,
    images: ['https://via.placeholder.com/400x400/06B6D4/ffffff?text=Charger'],
    stock: 75,
    rating: 4.3,
    total_reviews: 156,
    merchant: {
      id: 1,
      business_name: 'Gottabe Store',
      slug: 'gottabe-store'
    },
    category: {
      id: 1,
      name: 'Electronics',
      slug: 'electronics'
    }
  }
]

const mockCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics', products_count: 3 },
  { id: 2, name: 'Fashion', slug: 'fashion', products_count: 2 },
  { id: 3, name: 'Home & Living', slug: 'home-living', products_count: 1 },
]

export default function Shop() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('created_at')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [sortBy, selectedCategories, priceRange])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { sort: sortBy }

      if (selectedCategories.length > 0) {
        params.category = selectedCategories[0]
      }

      if (priceRange.min) params.min_price = priceRange.min
      if (priceRange.max) params.max_price = priceRange.max

      const response = await api.get('/products', { params })
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories(mockCategories)
    }
  }

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
        <p className="text-gray-600">
          {products.length} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Filter className="h-5 w-5 text-gray-500" />
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="ml-2 text-sm">
                      {category.name}
                      <span className="text-gray-500 ml-1">({category.products_count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <span className="self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={fetchProducts}
              >
                Apply
              </Button>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Customer Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          )}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCategories([])
                setPriceRange({ min: '', max: '' })
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded',
                    viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded',
                    viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created_at">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found.</p>
            </div>
          ) : (
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}