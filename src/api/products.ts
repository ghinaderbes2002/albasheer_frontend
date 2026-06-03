import { api } from '@/lib/api'
import type {
  Category,
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
} from '@/types/api'

// ─── Favorites ────────────────────────────────────────────────────────
export async function getFavorites(): Promise<ProductListItem[]> {
  const { data } = await api.get<ProductListItem[]>('/api/products/favorites/')
  return Array.isArray(data) ? data : (data as any).results ?? []
}

export async function toggleFavorite(productId: number): Promise<{ is_favorited: boolean }> {
  const { data } = await api.post<{ is_favorited: boolean }>(
    `/api/products/favorites/${productId}/toggle/`,
  )
  return data
}

export type ProductOrdering = 'price_asc' | 'price_desc' | ''

export interface ProductListParams {
  category?: string
  brand?: string
  search?: string
  page?: number
  ordering?: ProductOrdering
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
  const { page, ordering, ...filterParams } = params
  const { data } = await api.get<
    ProductListItem[] | PaginatedResponse<ProductListItem>
  >('/api/products/', { params: filterParams })

  const sortFn =
    ordering === 'price_asc'
      ? (a: ProductListItem, b: ProductListItem) => parseFloat(a.price) - parseFloat(b.price)
      : ordering === 'price_desc'
        ? (a: ProductListItem, b: ProductListItem) => parseFloat(b.price) - parseFloat(a.price)
        : null

  if (Array.isArray(data)) {
    const items = sortFn ? [...data].sort(sortFn) : data
    const pageNum = Math.max(1, page ?? 1)
    const start = (pageNum - 1) * PRODUCTS_PAGE_SIZE
    const end = start + PRODUCTS_PAGE_SIZE
    return {
      count: items.length,
      next: end < items.length ? `?page=${pageNum + 1}` : null,
      previous: pageNum > 1 ? `?page=${pageNum - 1}` : null,
      results: items.slice(start, end),
    }
  }

  // Paginated backend response — sort the current page
  if (sortFn) {
    return { ...data, results: [...data.results].sort(sortFn) }
  }
  return data
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/products/${encodeURIComponent(slug)}/`)
  return data
}

export interface ProductMeta {
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  image: string | null
  slug: string
  price: string
  is_available: boolean
  canonical_ar: string
  canonical_en: string
  seo_title: string
  meta_description: string
}

export async function getProductMeta(slug: string): Promise<ProductMeta> {
  const { data } = await api.get<ProductMeta>(`/api/products/${encodeURIComponent(slug)}/meta/`)
  return data
}

