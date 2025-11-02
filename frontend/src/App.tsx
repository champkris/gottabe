import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth Pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Public Pages
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import ProductDetail from '@/pages/ProductDetail'
import MerchantStore from '@/pages/MerchantStore'

// Customer Pages
import Cart from '@/pages/customer/Cart'
import Checkout from '@/pages/customer/Checkout'
import Orders from '@/pages/customer/Orders'
import OrderDetail from '@/pages/customer/OrderDetail'
import Profile from '@/pages/customer/Profile'

// Merchant Pages
import MerchantDashboard from '@/pages/merchant/Dashboard'
import MerchantProducts from '@/pages/merchant/Products'
import MerchantProductForm from '@/pages/merchant/ProductForm'
import MerchantOrders from '@/pages/merchant/Orders'
import MerchantAnalytics from '@/pages/merchant/Analytics'
import MerchantSettings from '@/pages/merchant/Settings'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMerchants from '@/pages/admin/Merchants'
import AdminCreators from '@/pages/admin/Creators'
import AdminProducts from '@/pages/admin/Products'
import AdminOrders from '@/pages/admin/Orders'
import AdminCategories from '@/pages/admin/Categories'
import AdminSettings from '@/pages/admin/Settings'

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="store/:slug" element={<MerchantStore />} />
      </Route>

      {/* Customer Protected Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Creator Dashboard Routes */}
      <Route
        path="/creator"
        element={
          <ProtectedRoute roles={['creator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MerchantDashboard />} />
        <Route path="products" element={<MerchantProducts />} />
        <Route path="products/new" element={<MerchantProductForm />} />
        <Route path="products/:id/edit" element={<MerchantProductForm />} />
        <Route path="analytics" element={<MerchantAnalytics />} />
        <Route path="settings" element={<MerchantSettings />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="creators" element={<AdminCreators />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Redirect based on role */}
      <Route
        path="/dashboard"
        element={
          user?.role === 'admin' ? (
            <Navigate to="/admin" replace />
          ) : user?.role === 'creator' ? (
            <Navigate to="/creator" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App