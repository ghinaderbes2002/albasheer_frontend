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

export interface CartBundleItem {
  bundle_id: number
  name: string
  name_ar: string
  price: string
  image: string | null
  /** Number of products inside the bundle — purely informational. */
  products_count: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  bundles: CartBundleItem[]

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void

  addBundle: (
    bundle: Omit<CartBundleItem, 'quantity'>,
    quantity?: number,
  ) => void
  updateBundleQuantity: (bundleId: number, quantity: number) => void
  removeBundle: (bundleId: number) => void

  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      bundles: [],

      // ─── Products ──────────────────────────────────────────────────
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

      // ─── Bundles ───────────────────────────────────────────────────
      addBundle: (bundle, quantity = 1) =>
        set((state) => {
          const existing = state.bundles.find(
            (b) => b.bundle_id === bundle.bundle_id,
          )
          if (existing) {
            return {
              bundles: state.bundles.map((b) =>
                b.bundle_id === bundle.bundle_id
                  ? { ...b, quantity: b.quantity + quantity }
                  : b,
              ),
            }
          }
          return { bundles: [...state.bundles, { ...bundle, quantity }] }
        }),

      updateBundleQuantity: (bundleId, quantity) =>
        set((state) => ({
          bundles:
            quantity <= 0
              ? state.bundles.filter((b) => b.bundle_id !== bundleId)
              : state.bundles.map((b) =>
                  b.bundle_id === bundleId ? { ...b, quantity } : b,
                ),
        })),

      removeBundle: (bundleId) =>
        set((state) => ({
          bundles: state.bundles.filter((b) => b.bundle_id !== bundleId),
        })),

      clear: () => set({ items: [], bundles: [] }),
    }),
    {
      name: 'albasheer-cart',
      version: 2,
      partialize: (state) => ({
        items: state.items,
        bundles: state.bundles,
      }),
      // Old persisted versions had only `items`; bring them forward by
      // ensuring `bundles` is always a real array.
      migrate: (persistedState: unknown) => {
        const s = persistedState as
          | { items?: unknown; bundles?: unknown }
          | null
        const next = {
          items: Array.isArray(s?.items) ? (s.items as CartItem[]) : [],
          bundles: Array.isArray(s?.bundles)
            ? (s.bundles as CartBundleItem[])
            : [],
        }
        // eslint-disable-next-line no-console
        console.log('[cart] migrate →', next)
        return next
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[cart] rehydrate error', error)
        } else {
          // eslint-disable-next-line no-console
          console.log('[cart] rehydrated state:', {
            items: state?.items,
            bundles: state?.bundles,
          })
        }
      },
    },
  ),
)

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Dev-only: expose the store so we can poke at it from DevTools
  // (e.g. `__cartStore.getState()` or `__cartStore.persist.getOptions()`).
  ;(window as unknown as { __cartStore?: typeof useCartStore }).__cartStore =
    useCartStore
}

export const useCartCount = () =>
  useCartStore(
    (s) =>
      s.items.reduce((sum, i) => sum + i.quantity, 0) +
      s.bundles.reduce((sum, b) => sum + b.quantity, 0),
  )

export const useCartSubtotal = () =>
  useCartStore(
    (s) =>
      s.items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0) +
      s.bundles.reduce(
        (sum, b) => sum + parseFloat(b.price) * b.quantity,
        0,
      ),
  )

export const useCartHasContent = () =>
  useCartStore((s) => s.items.length + s.bundles.length > 0)
