import { api } from '@/lib/api'
import type {
  Category,
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
  ProductVariant,
} from '@/types/api'

export interface ProductListParams {
  category?: string
  search?: string
  page?: number
}

/**
 * Backend `/api/products/` is NOT paginated (confirmed with backend).
 * The page size we apply client-side so the UI stays paginated.
 */
export const PRODUCTS_PAGE_SIZE = 12

export async function getCategories(): Promise<Category[]> {
  // Backend returns a plain array — no pagination on categories.
  const { data } = await api.get<Category[] | PaginatedResponse<Category>>(
    '/api/products/categories/',
  )
  return Array.isArray(data) ? data : data.results
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<ProductListItem>> {
  const { page, ...filterParams } = params
  const { data } = await api.get<
    ProductListItem[] | PaginatedResponse<ProductListItem>
  >('/api/products/', { params: filterParams })

  if (Array.isArray(data)) {
    // Backend returns the full filtered list as an array — slice client-side.
    const pageNum = Math.max(1, page ?? 1)
    const start = (pageNum - 1) * PRODUCTS_PAGE_SIZE
    const end = start + PRODUCTS_PAGE_SIZE
    const total = data.length
    return {
      count: total,
      next: end < total ? `?page=${pageNum + 1}` : null,
      previous: pageNum > 1 ? `?page=${pageNum - 1}` : null,
      results: data.slice(start, end),
    }
  }
  return data
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/products/${slug}/`)
  return data
}

export async function getProductVariants(slug: string): Promise<ProductVariant[]> {
  const { data } = await api.get<ProductVariant[] | PaginatedResponse<ProductVariant>>(
    `/api/products/${slug}/variants/`,
  )
  return Array.isArray(data) ? data : data.results
}

export async function getProductRelated(slug: string): Promise<ProductListItem[]> {
  const { data } = await api.get<ProductListItem[] | PaginatedResponse<ProductListItem>>(
    `/api/products/${slug}/related/`,
  )
  return Array.isArray(data) ? data : data.results
}
