import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  getProduct,
  getProductMeta,
  getProducts,
  getFavorites,
  toggleFavorite,
  type ProductListParams,
} from '@/api/products'
import { getBrands } from '@/api/admin'
import { useAuthStore } from '@/store/auth'

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
  favorites: () => [...catalogKeys.all, 'favorites'] as const,
  allProducts: () => [...catalogKeys.all, 'products'] as const,
  products: (params: ProductListParams) =>
    [...catalogKeys.all, 'products', params] as const,
  product: (slug: string) =>
    [...catalogKeys.all, 'product', slug] as const,
}

export function useCatalogBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: getBrands,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: getCategories,
    staleTime: 60 * 1000,
  })
}

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => getProducts(params),
    staleTime: 30 * 1000,
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

export function useFavorites() {
  const isLoggedIn = !!useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: catalogKeys.favorites(),
    queryFn: getFavorites,
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: catalogKeys.favorites() })
      qc.invalidateQueries({ queryKey: catalogKeys.allProducts() })
    },
  })
}

export function useProductMeta(slug: string | undefined) {
  return useQuery({
    queryKey: [...catalogKeys.product(slug ?? ''), 'meta'] as const,
    queryFn: () => getProductMeta(slug as string),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  })
}

