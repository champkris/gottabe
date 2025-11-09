import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const creatorLinks = [
    { to: '/creator', label: 'Dashboard' },
    { to: '/creator/products', label: 'Products' },
    { to: '/creator/analytics', label: 'Analytics' },
    { to: '/creator/settings', label: 'Settings' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/creators', label: 'Creators' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/settings', label: 'Settings' },
  ]

  const links = user?.role === 'admin' ? adminLinks : creatorLinks

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <img
              src="/images/gottabe_logo.png"
              alt="Gottabe"
              className="h-8 w-auto mb-2"
            />
            <h2 className="text-xl font-bold text-gray-800">
              {user?.role === 'admin' ? 'Admin Panel' : 'Creator Dashboard'}
            </h2>
            <p className="text-sm text-gray-600">{user?.name}</p>
          </div>

          <nav className="p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
