import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ProductCard from '@/components/ProductCard'
import { useCartStore } from '@/stores/cartStore'
import { cn, formatCurrency, calculateDiscount } from '@/lib/utils'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  sale_price?: number
  images: string[]
  stock: number
  rating: number
  total_reviews: number
  is_featured: boolean
  merchant: {
    id: number
    business_name: string
    slug: string
    rating: number
    total_reviews: number
  }
  category: {
    id: number
    name: string
    slug: string
  }
}

interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  user: {
    name: string
  }
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${slug}`)
      setProduct(response.data.product)
      setRelatedProducts(response.data.related_products || [])
      setReviews(response.data.product.reviews || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setLoading(false)
      // Don't navigate away, just show the "not found" message
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
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
    }, quantity)

    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && (!product || newQuantity <= product.stock)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.sale_price
    ? calculateDiscount(product.price, product.sale_price)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category.id}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImage] || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                -{discount}% OFF
              </span>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-black px-4 py-2 rounded font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'aspect-square rounded-lg overflow-hidden border-2 transition',
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to={`/shop?category=${product.category.id}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(Number(product.rating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {Number(product.rating).toFixed(1)} ({product.total_reviews} reviews)
            </span>
          </div>

          <div className="mb-6">
            {product.sale_price ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(product.sale_price)}
                </span>
                <span className="text-2xl text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-4xl font-bold">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Sold by</span>
            </div>
            <Link
              to={`/store/${product.merchant.slug}`}
              className="font-semibold text-primary hover:underline"
            >
              {product.merchant.business_name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(Number(product.merchant.rating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.merchant.total_reviews} ratings)
              </span>
            </div>
          </div>

          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                ✗ Out of Stock
              </p>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock <= 5 && `Only ${product.stock} left in stock`}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => toast.success('Added to wishlist')}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Free Delivery</p>
                <p className="text-xs text-gray-600">For orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <RotateCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
