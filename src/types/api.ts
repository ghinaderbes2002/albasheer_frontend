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
  /**
   * Backend returns the user object directly in the verify-code response
   * since 2026-05-10 — `role` is read from here for instant role-based
   * routing (no extra `/me` round-trip needed).
   */
  user: User
}

export interface RefreshResponse {
  access: string
}

export interface UserBranch {
  id: number
  name: string
}

export interface User {
  id: number
  phone: string
  first_name: string
  last_name: string
  address: string
  role: Role
  branch?: UserBranch
}

export interface DeliveryStaff {
  id: number
  phone: string
  first_name: string
  last_name: string
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

// ─── Bundles ──────────────────────────────────────────────────────────
export interface Bundle {
  id: number
  name: string
  name_ar: string
  description: string
  description_ar: string
  image: string | null
  price: string
  is_available: boolean
  products: ProductListItem[]
}

// ─── Branches ─────────────────────────────────────────────────────────
export interface Branch {
  id: number
  name: string
  name_ar: string
  city: string
  address: string
  phone: string
  maps_url: string
  is_active: boolean
}

export interface City {
  id: number
  name: string
  requires_deposit: boolean
}

// ─── Addresses ────────────────────────────────────────────────────────
export interface Address {
  id: number
  label: string
  city: string
  full_address: string
  is_default: boolean
  created_at: string
}

export interface AddressPayload {
  label: string
  city: string
  full_address: string
}

// ─── Orders ───────────────────────────────────────────────────────────
export interface OrderListItem {
  id: number
  status: OrderStatus
  status_display: string
  total_price: string
  deposit_amount: string
  shipping_fee: string
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

export interface OrderBundleItem {
  id: number
  bundle_name: string
  quantity: number
  unit_price: string
  total_price: string
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
  shipping_fee: string
  requires_deposit: boolean
  delivery_address: string
  customer_note: string
  rejection_reason: string
  estimated_delivery: string | null
  receipt_image: string | null
  delivery_staff_name: string | null
  items: OrderItem[]
  bundle_items?: OrderBundleItem[]
  logs: OrderLog[]
  created_at: string
  updated_at: string
}

export interface TrackingStage {
  status: OrderStatus
  label: string
  reached: boolean
  timestamp: string | null
}

export interface OrderTracking {
  current_status: OrderStatus
  stages: TrackingStage[]
}

export interface CreateOrderItemPayload {
  product_id: number
  quantity: number
}

export interface CreateOrderBundleItemPayload {
  bundle_id: number
  quantity: number
}

export interface CreateOrderPayload {
  city: string
  /** At least one of `items` / `bundle_items` must be non-empty. */
  items?: CreateOrderItemPayload[]
  bundle_items?: CreateOrderBundleItemPayload[]
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

// ─── Branch dashboard (staff) ─────────────────────────────────────────
// `BranchOrderListSerializer` and `BranchOrderDetailSerializer` from the
// backend — a slimmer shape than the customer's `OrderDetail`.
export interface BranchOrderListItem {
  id: number
  customer_phone: string
  customer_name: string
  status: OrderStatus
  total_price: string
  deposit_amount: string
  created_at: string
}

export interface BranchOrderItem {
  id: number
  product_name: string
  quantity: number
  unit_price: string
  /** Note: the staff serializer names this `total_price`, not `subtotal`. */
  total_price: string
}

export interface BranchOrderDetail {
  id: number
  customer_phone: string
  customer_name: string
  status: OrderStatus
  total_price: string
  deposit_amount: string
  deposit_percent: string
  delivery_address: string
  receipt_image: string | null
  items: BranchOrderItem[]
  created_at: string
}

export interface RejectOrderPayload {
  rejection_reason: string
}

export interface AssignDeliveryPayload {
  delivery_staff_id: number
}

// ─── Payment Methods ──────────────────────────────────────────────────
export interface PaymentMethod {
  id: number
  name_ar: string
  description_ar: string
  link: string
  is_active: boolean
  order: number
}

export interface PaymentMethodPayload {
  name_ar: string
  description_ar?: string
  link?: string
  is_active?: boolean
  order?: number
}

// ─── Admin ────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number
  phone: string
  first_name: string
  last_name: string
  role: Role
  branch?: UserBranch
  is_active: boolean
  created_at: string
}

export interface CreateUserPayload {
  phone: string
  first_name?: string
  last_name?: string
  role: Role
  branch_id?: number
  password: string
  is_active?: boolean
}

export interface AdminBranch {
  id: number
  name: string
  name_ar: string
  address: string
  phone: string
  maps_url: string
  is_active: boolean
  is_primary: boolean
}

export interface AdminCity {
  id: number
  name: string
  branch: number
  branch_name?: string
  requires_deposit: boolean
  is_active: boolean
}

export interface AdminCategory {
  id: number
  name: string
  name_ar: string
  slug: string
  icon: string | null
  is_active: boolean
  order: number
}

export interface AdminProduct {
  id: number
  name: string
  name_ar: string
  slug: string
  price: string
  category: number
  category_name?: string
  is_available: boolean
  is_featured: boolean
  main_image: string | null
  images: ProductImage[]
  specs: ProductSpec[]
  description: string
  description_ar: string
}

export interface AdminBundle {
  id: number
  name: string
  name_ar: string
  description_ar: string
  price: string
  is_available: boolean
  image: string | null
  products: ProductListItem[]
}

export interface AdminOrder {
  id: number
  status: OrderStatus
  status_display: string
  customer_phone: string
  customer_name: string
  branch_name: string
  total_price: string
  deposit_amount: string
  shipping_fee: string
  delivery_address: string
  created_at: string
}

export interface AdminStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  delivered_orders: number
  cancelled_orders: number
  total_revenue: string
  today_orders: number
  today_revenue: string
}

export interface SalesReportEntry {
  date: string
  orders_count: number
  revenue: string
}

export interface TopProductEntry {
  product_name: string
  total_sold: number
  revenue: string
}

export interface TopBranchEntry {
  branch_name: string
  total_orders: number
  revenue: string
}

// ─── Ads ──────────────────────────────────────────────────────────────
export type AdMediaType = 'image' | 'video'

export interface Ad {
  id: number
  title: string
  media_type: AdMediaType
  /** Relative or absolute URL — pass through `resolveMediaUrl`. */
  file: string
  /** Optional click target. Empty string means non-clickable. */
  link: string
  order: number
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
