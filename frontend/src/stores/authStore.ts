import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'

interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'merchant' | 'admin'
  phone?: string
  address?: string
  merchant?: {
    id: number
    business_name: string
    slug: string
    is_approved: boolean
    commission_rate: number
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        const { user, token } = response.data

        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      register: async (data: any) => {
        const response = await api.post('/auth/register', data)
        const { user, token } = response.data

        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)