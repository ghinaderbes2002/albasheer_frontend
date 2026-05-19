import { api, API_BASE } from '@/lib/api'
import type {
  AdminBranch,
  AdminBundle,
  AdminCategory,
  AdminCity,
  AdminOrder,
  AdminProduct,
  AdminStats,
  AdminUser,
  CreateUserPayload,
  OrderDetail,
  OrderStatus,
  PaginatedResponse,
  SalesReportEntry,
  TopBranchEntry,
  TopProductEntry,
} from '@/types/api'

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

// ─── Stats ────────────────────────────────────────────────────────────
export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/api/admin/stats/')
  return data
}

// ─── Users ────────────────────────────────────────────────────────────
export async function getAdminUsers(params?: {
  role?: string
  search?: string
}): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[] | PaginatedResponse<AdminUser>>(
    '/api/admin/users/',
    { params },
  )
  return unwrap(data)
}

export async function getAdminUser(id: number | string): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>(`/api/admin/users/${id}/`)
  return data
}

export async function createAdminUser(
  payload: CreateUserPayload,
): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>('/api/admin/users/', payload)
  return data
}

export async function updateAdminUser(
  id: number | string,
  payload: Partial<CreateUserPayload & { is_active: boolean }>,
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/admin/users/${id}/`, payload)
  return data
}

export async function deleteAdminUser(id: number | string): Promise<void> {
  await api.delete(`/api/admin/users/${id}/`)
}

export async function resetUserPassword(
  id: number | string,
  newPassword: string,
): Promise<void> {
  await api.post(`/api/admin/users/${id}/reset-password/`, {
    new_password: newPassword,
  })
}

// ─── Branches ─────────────────────────────────────────────────────────
export async function getAdminBranches(): Promise<AdminBranch[]> {
  const { data } = await api.get<AdminBranch[] | PaginatedResponse<AdminBranch>>(
    '/api/admin/branches/',
  )
  return unwrap(data)
}

export async function createAdminBranch(
  payload: Omit<AdminBranch, 'id'>,
): Promise<AdminBranch> {
  const { data } = await api.post<AdminBranch>('/api/admin/branches/', payload)
  return data
}

export async function updateAdminBranch(
  id: number | string,
  payload: Partial<Omit<AdminBranch, 'id'>>,
): Promise<AdminBranch> {
  const { data } = await api.patch<AdminBranch>(
    `/api/admin/branches/${id}/`,
    payload,
  )
  return data
}

export async function deleteAdminBranch(id: number | string): Promise<void> {
  await api.delete(`/api/admin/branches/${id}/`)
}

// ─── Cities ───────────────────────────────────────────────────────────
export async function getAdminCities(): Promise<AdminCity[]> {
  const { data } = await api.get<AdminCity[] | PaginatedResponse<AdminCity>>(
    '/api/admin/cities/',
  )
  return unwrap(data)
}

export async function createAdminCity(payload: {
  name: string
  branch: number
  requires_deposit: boolean
  is_active?: boolean
}): Promise<AdminCity> {
  const { data } = await api.post<AdminCity>('/api/admin/cities/', payload)
  return data
}

export async function updateAdminCity(
  id: number | string,
  payload: Partial<{ name: string; branch: number; requires_deposit: boolean; is_active: boolean }>,
): Promise<AdminCity> {
  const { data } = await api.patch<AdminCity>(`/api/admin/cities/${id}/`, payload)
  return data
}

export async function deleteAdminCity(id: number | string): Promise<void> {
  await api.delete(`/api/admin/cities/${id}/`)
}

// ─── Categories ───────────────────────────────────────────────────────
export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data } = await api.get<AdminCategory[] | PaginatedResponse<AdminCategory>>(
    '/api/admin/categories/',
  )
  return unwrap(data)
}

export async function createAdminCategory(payload: FormData): Promise<AdminCategory> {
  const { data } = await api.post<AdminCategory>('/api/admin/categories/', payload)
  return data
}

export async function updateAdminCategory(
  id: number | string,
  payload: Partial<Omit<AdminCategory, 'id' | 'slug' | 'icon'>>,
): Promise<AdminCategory> {
  const { data } = await api.patch<AdminCategory>(
    `/api/admin/categories/${id}/`,
    payload,
  )
  return data
}

export async function deleteAdminCategory(id: number | string): Promise<void> {
  await api.delete(`/api/admin/categories/${id}/`)
}

// ─── Products ─────────────────────────────────────────────────────────
export async function getAdminProducts(params?: {
  category?: number | string
  search?: string
  is_available?: boolean
}): Promise<AdminProduct[]> {
  const { data } = await api.get<AdminProduct[] | PaginatedResponse<AdminProduct>>(
    '/api/admin/products/',
    { params },
  )
  return unwrap(data)
}

export async function getAdminProduct(id: number | string): Promise<AdminProduct> {
  const { data } = await api.get<AdminProduct>(`/api/admin/products/${id}/`)
  return data
}

export async function createAdminProduct(payload: FormData): Promise<AdminProduct> {
  const { data } = await api.post<AdminProduct>('/api/admin/products/', payload)
  return data
}

export async function updateAdminProduct(
  id: number | string,
  payload: Partial<Omit<AdminProduct, 'id' | 'slug' | 'images' | 'specs' | 'main_image'>>,
): Promise<AdminProduct> {
  const { data } = await api.patch<AdminProduct>(
    `/api/admin/products/${id}/`,
    payload,
  )
  return data
}

export async function deleteAdminProduct(id: number | string): Promise<void> {
  await api.delete(`/api/admin/products/${id}/`)
}

export async function toggleProductAvailability(
  id: number | string,
): Promise<AdminProduct> {
  const { data } = await api.post<AdminProduct>(
    `/api/admin/products/${id}/toggle-availability/`,
  )
  return data
}

function getCsrfToken(): string {
  return document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] ?? ''
}

export async function uploadProductImages(
  productId: number | string,
  formData: FormData,
): Promise<void> {
  const file = formData.get('image') as File | null
  if (!file) throw new Error('No image provided')

  const fd = new FormData()
  fd.append('product', String(productId))
  fd.append('image', file)
  fd.append('is_main', 'false')
  fd.append('csrfmiddlewaretoken', getCsrfToken())
  fd.append('_save', 'Save')

  const res = await fetch(`${API_BASE}/admin/products/productimage/add/`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
    redirect: 'manual',
  })

  // Django admin redirects (302) on success → opaqueredirect for cross-origin
  if (res.type !== 'opaqueredirect' && !res.ok) {
    throw new Error('فشل رفع الصورة')
  }
}

export async function deleteProductImage(
  _productId: number | string,
  imageId: number | string,
): Promise<void> {
  const fd = new FormData()
  fd.append('csrfmiddlewaretoken', getCsrfToken())
  fd.append('post', 'yes')

  const res = await fetch(`${API_BASE}/admin/products/productimage/${imageId}/delete/`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
    redirect: 'manual',
  })

  if (res.type !== 'opaqueredirect' && !res.ok) {
    throw new Error('فشل حذف الصورة')
  }
}

// ─── Bundles ──────────────────────────────────────────────────────────
export async function getAdminBundles(): Promise<AdminBundle[]> {
  const { data } = await api.get<AdminBundle[] | PaginatedResponse<AdminBundle>>(
    '/api/admin/bundles/',
  )
  return unwrap(data)
}

export async function createAdminBundle(payload: FormData): Promise<AdminBundle> {
  const { data } = await api.post<AdminBundle>('/api/admin/bundles/', payload)
  return data
}


export async function updateAdminBundle(
  id: number | string,
  payload: Partial<Omit<AdminBundle, 'id' | 'image' | 'products'>>,
): Promise<AdminBundle> {
  const { data } = await api.patch<AdminBundle>(`/api/admin/bundles/${id}/`, payload)
  return data
}

export async function deleteAdminBundle(id: number | string): Promise<void> {
  await api.delete(`/api/admin/bundles/${id}/`)
}

export async function toggleBundleAvailability(
  id: number | string,
): Promise<AdminBundle> {
  const { data } = await api.post<AdminBundle>(
    `/api/admin/bundles/${id}/toggle-active/`,
  )
  return data
}

// ─── Orders ───────────────────────────────────────────────────────────
export async function getAdminOrders(params?: {
  status?: OrderStatus
  branch?: number | string
  search?: string
  date_from?: string
  date_to?: string
}): Promise<AdminOrder[]> {
  const { data } = await api.get<AdminOrder[] | PaginatedResponse<AdminOrder>>(
    '/api/admin/orders/',
    { params },
  )
  return unwrap(data)
}

export async function getAdminOrder(id: number | string): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/api/admin/orders/${id}/`)
  return data
}

export async function cancelAdminOrder(
  id: number | string,
  note?: string,
): Promise<void> {
  await api.post(`/api/admin/orders/${id}/cancel/`, { note })
}

// ─── Reports ──────────────────────────────────────────────────────────
export async function getSalesReport(params?: {
  date_from?: string
  date_to?: string
  branch?: number | string
}): Promise<SalesReportEntry[]> {
  const { data } = await api.get<SalesReportEntry[]>(
    '/api/admin/reports/sales/',
    { params },
  )
  return data
}

export async function getTopProductsReport(params?: {
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<TopProductEntry[]> {
  const { data } = await api.get<TopProductEntry[]>(
    '/api/admin/reports/top-products/',
    { params },
  )
  return data
}

export async function getTopBranchesReport(params?: {
  date_from?: string
  date_to?: string
}): Promise<TopBranchEntry[]> {
  const { data } = await api.get<TopBranchEntry[]>(
    '/api/admin/reports/top-branches/',
    { params },
  )
  return data
}
