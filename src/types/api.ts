/**
 * Types mirroring the Albasheer Django REST backend.
 * Source of truth: FRONTEND_API_GUIDE.md
 */

export type Role = 'customer' | 'branch_manager' | 'delivery' | 'admin'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'

// ─── Auth ─────────────────────────────────────────────────────────────
export interface AuthResponse {
  access: string
  refresh: string
  is_new: boolean
}

export interface RefreshResponse {
  access: string
}

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  address: string
  /**
   * Role is not (yet) returned by `/api/auth/me/` per the current API guide.
   * Kept optional so downstream guards still type-check; we will resolve
   * the actual source (JWT claim, dedicated endpoint, …) in Phase 2.
   */
  role?: Role
}

export interface ProfilePatch {
  first_name?: string
  last_name?: string
  address?: string
}

// ─── Categories ───────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  name_ar: string
  slug: string
  icon: string | null
}

// ─── Products ─────────────────────────────────────────────────────────
export interface ProductImage {
  id: number
  image: string
  is_main: boolean
}

export interface ProductSpec {
  id: number
  key: string
  key_ar: string
  value: string
  value_ar: string
}

export interface ProductListItem {
  id: number
  name: string
  name_ar: string
  slug: string
  price: string
  category: Category
  main_image: string | null
}

export interface ProductDetail extends ProductListItem {
  description: string
  description_ar: string
  images: ProductImage[]
  specs: ProductSpec[]
  is_available: boolean
}

// ─── Branches ─────────────────────────────────────────────────────────
export interface Branch {
  id: number
  name: string
  city: string
  address: string
  phone: string
  is_active: boolean
}

// ─── Orders ───────────────────────────────────────────────────────────
export interface OrderListItem {
  id: number
  status: OrderStatus
  status_display: string
  total_price: string
  deposit_amount: string
  branch_name: string
  item_count: number
  delivery_address: string
  created_at: string
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  unit_price: string
  quantity: number
  subtotal: string
}

export interface OrderLog {
  id: number
  old_status: OrderStatus | ''
  new_status: OrderStatus
  changed_by_name: string | null
  note: string
  changed_at: string
}

export interface OrderDetail {
  id: number
  status: OrderStatus
  status_display: string
  branch_name: string
  total_price: string
  deposit_percent: string
  deposit_amount: string
  delivery_address: string
  customer_note: string
  rejection_reason: string
  estimated_delivery: string | null
  receipt_image: string | null
  delivery_staff_name: string | null
  items: OrderItem[]
  logs: OrderLog[]
  created_at: string
  updated_at: string
}

export interface CreateOrderItemPayload {
  product_id: number
  quantity: number
}

export interface CreateOrderPayload {
  branch_id: number
  items: CreateOrderItemPayload[]
  deposit_amount: string
  delivery_address: string
  customer_note?: string
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus
  delivery_staff_id?: number
  rejection_reason?: string
  estimated_delivery?: string
  note?: string
}

// ─── Pagination ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── Error envelope ───────────────────────────────────────────────────
export interface ApiErrorBody {
  detail?: string
  non_field_errors?: string[]
  [field: string]: unknown
}
