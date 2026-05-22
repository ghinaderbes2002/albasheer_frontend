import { useQuery } from '@tanstack/react-query'
import {
  getCategories,
  getProduct,
  getProducts,
  getProductVariants,
  getProductRelated,
  type ProductListParams,
} from '@/api/products'

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (params: ProductListParams) =>
    [...catalogKeys.all, 'products', params] as const,
  product: (slug: string) =>
    [...catalogKeys.all, 'product', slug] as const,
  productVariants: (slug: string) =>
    [...catalogKeys.all, 'product', slug, 'variants'] as const,
  productRelated: (slug: string) =>
    [...catalogKeys.all, 'product', slug, 'related'] as const,
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

export function useProductVariants(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.productVariants(slug ?? ''),
    queryFn: () => getProductVariants(slug as string),
    enabled: !!slug,
    staleTime: 60 * 1000,
  })
}

export function useProductRelated(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.productRelated(slug ?? ''),
    queryFn: () => getProductRelated(slug as string),
    enabled: !!slug,
    staleTime: 60 * 1000,
  })
}
