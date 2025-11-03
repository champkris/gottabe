import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Tag, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  products_count?: number
  image?: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse by Category
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Discover thousands of products organized by category. Find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Tag className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {categories.reduce((acc, cat) => acc + (cat.products_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                New
              </div>
              <div className="text-sm text-gray-600">Arrivals Daily</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Grid */}
        {categories.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">All Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      {/* Category Icon/Image */}
                      <div className="relative aspect-square mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag className="h-16 w-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                        )}

                        {/* Trending Badge - show on some categories */}
                        {category.products_count && category.products_count > 50 && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Popular
                          </div>
                        )}
                      </div>

                      {/* Category Name */}
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>

                      {/* Description */}
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* Product Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {category.products_count || 0} {category.products_count === 1 ? 'product' : 'products'}
                        </span>
                        <span className="text-primary text-sm font-medium group-hover:underline">
                          Browse →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No categories found</p>
              <p className="text-sm text-gray-500">Categories will appear here once they're added.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-600 mb-8">
              Browse our entire collection or use the search to find specific products.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/shop"
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Browse All Products
              </Link>
              <Link
                to="/deals"
                className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition font-medium"
              >
                View Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
