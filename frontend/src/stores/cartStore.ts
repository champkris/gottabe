import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  productId: number
  merchantId: number
  name: string
  price: number
  quantity: number
  image?: string
  stock: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getItemsByMerchant: () => Map<number, CartItem[]>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find(i => i.productId === item.productId)

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + quantity
          if (newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items available`)
            return
          }
          set({
            items: items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: newQuantity }
                : i
            ),
          })
          toast.success('Cart updated')
        } else {
          // Add new item
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} items available`)
            return
          }
          set({ items: [...items, { ...item, quantity }] })
          toast.success('Added to cart')
        }
      },

      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.productId !== productId),
        }))
        toast.success('Removed from cart')
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const { items } = get()
        const item = items.find(i => i.productId === productId)

        if (item && quantity > item.stock) {
          toast.error(`Only ${item.stock} items available`)
          return
        }

        set({
          items: items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getItemsByMerchant: () => {
        const { items } = get()
        const merchantItems = new Map<number, CartItem[]>()

        items.forEach(item => {
          const merchantId = item.merchantId
          if (!merchantItems.has(merchantId)) {
            merchantItems.set(merchantId, [])
          }
          merchantItems.get(merchantId)!.push(item)
        })

        return merchantItems
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)