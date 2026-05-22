import { useQuery } from '@tanstack/react-query'
import {
  getCategories,
  getProduct,
  getProducts,
  type ProductListParams,
} from '@/api/products'

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (params: ProductListParams) =>
    [...catalogKeys.all, 'products', params] as const,
  product: (slug: string) =>
    [...catalogKeys.all, 'product', slug] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  })
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => getProducts(params),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev, // smooth pagination/filter transitions
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.product(slug ?? ''),
    queryFn: () => getProduct(slug as string),
    enabled: !!slug,
    staleTime: 60 * 1000,
  })
}

