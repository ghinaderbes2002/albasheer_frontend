import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  product_id: number
  slug: string
  name: string
  name_ar: string
  price: string
  image: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.product_id !== productId)
              : state.items.map((i) =>
                  i.product_id === productId ? { ...i, quantity } : i,
                ),
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'albasheer-cart',
    },
  ),
)

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))

export const useCartSubtotal = () =>
  useCartStore((s) =>
    s.items.reduce(
      (sum, i) => sum + parseFloat(i.price) * i.quantity,
      0,
    ),
  )
