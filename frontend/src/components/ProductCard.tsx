import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { cn, formatCurrency, calculateDiscount } from '@/lib/utils'
import toast from 'react-hot-toast'
import AvailabilityCountdown from './AvailabilityCountdown'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  sale_price?: number
  images?: string[]
  stock: number
  rating: number
  total_reviews: number
  available_from?: string | null
  available_to?: string | null
  merchant: {
    id: number
    business_name: string
    slug: string
  }
  category: {
    id: number
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()

    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    addItem({
      id: product.id,
      productId: product.id,
      merchantId: product.merchant.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0],
      stock: product.stock,
    })
  }

  const discount = product.sale_price
    ? calculateDiscount(product.price, product.sale_price)
    : 0

  const productImage = product.images?.[0] || '/placeholder-product.png'

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={`/product/${product.slug}`}>
          <div className="flex">
            {/* Image */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discount}%
                </span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-black px-3 py-1 rounded font-semibold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Category & Merchant */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>{product.category.name}</span>
                    <span>•</span>
                    <span>{product.merchant.business_name}</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.total_reviews} reviews)
                    </span>
                  </div>

                  {/* Availability Countdown */}
                  <AvailabilityCountdown
                    availableFrom={product.available_from || null}
                    availableTo={product.available_to || null}
                    compact={true}
                  />
                </div>

                {/* Price & Actions */}
                <div className="text-right ml-4">
                  {/* Price */}
                  <div className="mb-3">
                    {product.sale_price ? (
                      <>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(product.sale_price)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold">
                        {formatCurrency(product.price)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        toast.success('Added to wishlist')
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    )
  }

  // Grid View (default)
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black px-3 py-1 rounded font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Actions (visible on hover) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                toast.success('Added to wishlist')
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                // Navigate to product detail
                window.location.href = `/product/${product.slug}`
              }}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Category & Merchant */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>{product.category.name}</span>
            <span>•</span>
            <span>{product.merchant.business_name}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({product.total_reviews})
            </span>
          </div>

          {/* Availability Countdown */}
          <div className="mb-3">
            <AvailabilityCountdown
              availableFrom={product.available_from || null}
              availableTo={product.available_to || null}
              compact={true}
            />
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              {product.sale_price ? (
                <>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}