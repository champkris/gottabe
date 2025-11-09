import { Link } from 'react-router-dom'
import { ShoppingBag, Store, Users, Package, Star, TrendingUp, Shield, Truck, CreditCard, HeadphonesIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  // Temporarily remove API calls to fix loading issue

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Welcome to Gottabe Marketplace
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Discover amazing products from trusted merchants. Shop with confidence and enjoy great deals every day.
              </p>
              <div className="flex gap-4">
                <Link to="/shop">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 border-2 border-white/20 shadow-lg">
                    Become a Merchant
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm opacity-75">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-75">Merchants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm opacity-75">Happy Customers</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                <div className="relative p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/90 backdrop-blur">
                      <CardContent className="p-4">
                        <Package className="h-8 w-8 text-blue-600 mb-2" />
                        <div className="font-semibold">Fast Delivery</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur">
                      <CardContent className="p-4">
                        <Shield className="h-8 w-8 text-green-600 mb-2" />
                        <div className="font-semibold">Secure Payment</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur">
                      <CardContent className="p-4">
                        <Star className="h-8 w-8 text-yellow-600 mb-2" />
                        <div className="font-semibold">Top Quality</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur">
                      <CardContent className="p-4">
                        <HeadphonesIcon className="h-8 w-8 text-purple-600 mb-2" />
                        <div className="font-semibold">24/7 Support</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Gottabe?</h2>
            <p className="text-gray-600">We provide the best shopping experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Get your products delivered quickly with our reliable shipping partners.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  Shop with confidence using our secure payment gateway.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Our customer support team is here to help you anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section for Merchants */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Selling Today</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of successful merchants on our platform. Set up your store in minutes and reach thousands of customers.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
            <div>
              <Store className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Easy Setup</h3>
              <p className="text-sm opacity-75">Get your store running in minutes</p>
            </div>
            <div>
              <Users className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Large Audience</h3>
              <p className="text-sm opacity-75">Access thousands of customers</p>
            </div>
            <div>
              <TrendingUp className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Grow Your Business</h3>
              <p className="text-sm opacity-75">Analytics and tools to succeed</p>
            </div>
          </div>

          <Link to="/auth/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
              Become a Merchant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Secure Payments</p>
            </div>
            <div className="text-center">
              <Truck className="h-10 w-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Fast Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="h-10 w-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">Buyer Protection</p>
            </div>
            <div className="text-center">
              <HeadphonesIcon className="h-10 w-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}