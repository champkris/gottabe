import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items } = useCartStore()

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-2 md:gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <img
                  src="/images/gottabe_logo.png"
                  alt="Gottabe"
                  className="h-6 sm:h-7 md:h-8 w-auto object-contain"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/shop" className="text-gray-700 hover:text-primary transition">
                  Shop
                </Link>
                <Link to="/categories" className="text-gray-700 hover:text-primary transition">
                  Categories
                </Link>
                <Link to="/deals" className="text-gray-700 hover:text-primary transition">
                  Deals
                </Link>
                <Link to="/stores" className="text-gray-700 hover:text-primary transition">
                  Stores
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link to="/customer/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
                    <User className="h-6 w-6 text-gray-700" />
                    <span className="hidden md:block text-sm">{user?.name}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {user?.role === 'merchant' && (
                      <Link
                        to="/merchant"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Merchant Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/customer/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/customer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/register" className="hidden md:block">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                to="/shop"
                className="block py-2 text-gray-700 hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/categories"
                className="block py-2 text-gray-700 hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/deals"
                className="block py-2 text-gray-700 hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Deals
              </Link>
              <Link
                to="/stores"
                className="block py-2 text-gray-700 hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stores
              </Link>
              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/auth/register"
                    className="block py-2 text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About Gottabe</h3>
              <p className="text-gray-400 text-sm">
                Your trusted multi-merchant platform for quality products from verified sellers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* For Merchants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Merchants</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/auth/register" className="hover:text-white transition">Sell on Gottabe</Link></li>
                <li><Link to="/merchant/guide" className="hover:text-white transition">Merchant Guide</Link></li>
                <li><Link to="/merchant/fees" className="hover:text-white transition">Fees & Pricing</Link></li>
                <li><Link to="/merchant/support" className="hover:text-white transition">Merchant Support</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to get special offers and updates.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2024 Gottabe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}