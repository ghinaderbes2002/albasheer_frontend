import { api } from '@/lib/api'
import type {
  AdminAd,
  AdminBranch,
  AdminPaymentMethod,
  Brand,
  ContentStats,
  SiteSettings,
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
  ProductListItem,
  ProductVariant,
  SalesReportResponse,
  TopBranchEntry,
  TopProductEntry,
  VariantOption,
  VariantType,
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

// ─── Brands (public list for product form) ────────────────────────────
export async function getBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[] | PaginatedResponse<Brand>>('/api/products/brands/')
  return Array.isArray(data) ? data : data.results ?? []
}

// ─── Admin Brands (full CRUD) ─────────────────────────────────────────
export async function getAdminBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[] | PaginatedResponse<Brand>>('/api/admin/brands/')
  return unwrap(data)
}

export async function createBrand(payload: { name: string; name_ar: string }): Promise<Brand> {
  const { data } = await api.post<Brand>('/api/admin/brands/', payload)
  return data
}

export async function updateAdminBrand(id: number, payload: Partial<Omit<Brand, 'id' | 'slug'>>): Promise<Brand> {
  const { data } = await api.patch<Brand>(`/api/admin/brands/${id}/`, payload)
  return data
}

export async function deleteAdminBrand(id: number): Promise<void> {
  await api.delete(`/api/admin/brands/${id}/`)
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

export async function uploadProductImages(
  productId: number | string,
  formData: FormData,
): Promise<void> {
  const file = formData.get('image') as File | null
  if (!file) throw new Error('No image provided')

  const fd = new FormData()
  fd.append('images', file)

  await api.post(`/api/admin/products/${productId}/images/`, fd)
}

export async function deleteProductImage(
  productId: number | string,
  imageId: number | string,
): Promise<void> {
  await api.delete(`/api/admin/products/${productId}/images/${imageId}/`)
}

export async function updateAdminProductSpecs(
  id: number | string,
  specs: Array<{ key: string; key_ar: string; value: string; value_ar: string }>,
): Promise<AdminProduct> {
  const { data } = await api.patch<AdminProduct>(`/api/admin/products/${id}/specs/`, { specs })
  return data
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

export async function setAdminOrderShippingFee(
  id: number | string,
  shippingFee: number,
): Promise<void> {
  await api.patch(`/api/admin/orders/${id}/set-shipping-fee/`, { shipping_fee: shippingFee })
}

// ─── Ads ──────────────────────────────────────────────────────────────
export async function getAdminAds(): Promise<AdminAd[]> {
  const { data } = await api.get<AdminAd[] | PaginatedResponse<AdminAd>>('/api/admin/ads/')
  return unwrap(data)
}

export async function getAdminAd(id: number | string): Promise<AdminAd> {
  const { data } = await api.get<AdminAd>(`/api/admin/ads/${id}/`)
  return data
}

export async function createAdminAd(payload: FormData): Promise<AdminAd> {
  const { data } = await api.post<AdminAd>('/api/admin/ads/', payload)
  return data
}

export async function updateAdminAd(
  id: number | string,
  payload: Partial<Omit<AdminAd, 'id' | 'file'>> | FormData,
): Promise<AdminAd> {
  const { data } = await api.patch<AdminAd>(`/api/admin/ads/${id}/`, payload)
  return data
}

export async function deleteAdminAd(id: number | string): Promise<void> {
  await api.delete(`/api/admin/ads/${id}/`)
}

export async function toggleAdActive(id: number | string): Promise<AdminAd> {
  const { data } = await api.post<AdminAd>(`/api/admin/ads/${id}/toggle-active/`)
  return data
}

// ─── Payment Methods ──────────────────────────────────────────────────
export async function getAdminPaymentMethods(): Promise<AdminPaymentMethod[]> {
  const { data } = await api.get<AdminPaymentMethod[] | PaginatedResponse<AdminPaymentMethod>>(
    '/api/admin/payment-methods/',
  )
  return unwrap(data)
}

export async function createAdminPaymentMethod(payload: FormData): Promise<AdminPaymentMethod> {
  const { data } = await api.post<AdminPaymentMethod>('/api/admin/payment-methods/', payload)
  return data
}

export async function updateAdminPaymentMethod(
  id: number | string,
  payload: Partial<Omit<AdminPaymentMethod, 'id' | 'image' | 'branch_name'>> | FormData,
): Promise<AdminPaymentMethod> {
  const { data } = await api.patch<AdminPaymentMethod>(`/api/admin/payment-methods/${id}/`, payload)
  return data
}

export async function deleteAdminPaymentMethod(id: number | string): Promise<void> {
  await api.delete(`/api/admin/payment-methods/${id}/`)
}

// ─── Site Settings ────────────────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await api.get<SiteSettings>('/api/admin/settings/')
  return data
}

export async function updateSiteSettings(payload: Partial<SiteSettings>): Promise<SiteSettings> {
  const { data } = await api.patch<SiteSettings>('/api/admin/settings/', payload)
  return data
}

// ─── Content Stats ────────────────────────────────────────────────────
export async function getContentStats(): Promise<ContentStats> {
  const { data } = await api.get<ContentStats>('/api/admin/content/stats/')
  return data
}

// ─── Reports ──────────────────────────────────────────────────────────
export async function getSalesReport(params?: {
  date_from?: string
  date_to?: string
  branch?: number | string
}): Promise<SalesReportResponse> {
  const { data } = await api.get<SalesReportResponse>('/api/admin/reports/sales/', { params })
  return data
}

export async function getTopProductsReport(params?: {
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<TopProductEntry[]> {
  const { data } = await api.get<TopProductEntry[]>('/api/admin/reports/top-products/', { params })
  return data
}

export async function getTopBranchesReport(params?: {
  date_from?: string
  date_to?: string
}): Promise<TopBranchEntry[]> {
  const { data } = await api.get<TopBranchEntry[]>('/api/admin/reports/top-branches/', { params })
  return data
}

// ─── Variant Types ────────────────────────────────────────────────────
export async function getAdminVariantTypes(): Promise<VariantType[]> {
  const { data } = await api.get<VariantType[] | PaginatedResponse<VariantType>>('/api/admin/variant-types/')
  return unwrap(data)
}

export async function createAdminVariantType(payload: { name: string; name_ar: string }): Promise<VariantType> {
  const { data } = await api.post<VariantType>('/api/admin/variant-types/', payload)
  return data
}

export async function updateAdminVariantType(
  id: number | string,
  payload: Partial<{ name: string; name_ar: string }>,
): Promise<VariantType> {
  const { data } = await api.patch<VariantType>(`/api/admin/variant-types/${id}/`, payload)
  return data
}

export async function deleteAdminVariantType(id: number | string): Promise<void> {
  await api.delete(`/api/admin/variant-types/${id}/`)
}

// ─── Variant Options ──────────────────────────────────────────────────
export async function getAdminVariantOptions(typeId: number | string): Promise<VariantOption[]> {
  const { data } = await api.get<VariantOption[] | PaginatedResponse<VariantOption>>(
    `/api/admin/variant-types/${typeId}/options/`,
  )
  return unwrap(data)
}

export async function createAdminVariantOption(
  typeId: number | string,
  payload: { value: string; value_ar: string },
): Promise<VariantOption> {
  const { data } = await api.post<VariantOption>(`/api/admin/variant-types/${typeId}/options/`, payload)
  return data
}

export async function updateAdminVariantOption(
  id: number | string,
  payload: Partial<{ value: string; value_ar: string }>,
): Promise<VariantOption> {
  const { data } = await api.patch<VariantOption>(`/api/admin/variant-options/${id}/`, payload)
  return data
}

export async function deleteAdminVariantOption(id: number | string): Promise<void> {
  await api.delete(`/api/admin/variant-options/${id}/`)
}

// ─── Product Variants ─────────────────────────────────────────────────
export async function getProductVariants(productId: number | string): Promise<ProductVariant[]> {
  const { data } = await api.get<ProductVariant[] | PaginatedResponse<ProductVariant>>(
    `/api/admin/products/${productId}/variants/`,
  )
  return unwrap(data)
}

export async function addProductVariant(
  productId: number | string,
  payload: { option_id: number; price: number | string; stock: number; is_available: boolean },
): Promise<ProductVariant> {
  const { data } = await api.post<ProductVariant>(`/api/admin/products/${productId}/variants/`, payload)
  return data
}

export async function updateProductVariant(
  variantId: number | string,
  payload: Partial<{ price: number | string; stock: number; is_available: boolean }>,
): Promise<ProductVariant> {
  const { data } = await api.patch<ProductVariant>(`/api/admin/product-variants/${variantId}/`, payload)
  return data
}

export async function deleteProductVariant(variantId: number | string): Promise<void> {
  await api.delete(`/api/admin/product-variants/${variantId}/`)
}

export async function uploadVariantImage(
  variantId: number | string,
  formData: FormData,
): Promise<void> {
  await api.post(`/api/admin/product-variants/${variantId}/images/`, formData)
}

export async function deleteVariantImage(imageId: number | string): Promise<void> {
  await api.delete(`/api/admin/product-variant-images/${imageId}/`)
}

// ─── Related Products ─────────────────────────────────────────────────
export async function getRelatedProducts(productId: number | string): Promise<ProductListItem[]> {
  const { data } = await api.get<ProductListItem[] | PaginatedResponse<ProductListItem>>(
    `/api/admin/products/${productId}/related/`,
  )
  return unwrap(data)
}

export async function addRelatedProduct(
  productId: number | string,
  relatedProductId: number,
): Promise<void> {
  await api.post(`/api/admin/products/${productId}/related/`, { related_product_id: relatedProductId })
}

export async function removeRelatedProduct(
  productId: number | string,
  relatedId: number | string,
): Promise<void> {
  await api.delete(`/api/admin/products/${productId}/related/${relatedId}/`)
}
