import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAccountantLowStock,
  getAccountantProducts,
  getAccountantSalesReport,
  getAccountantTopProducts,
  updateAccountantProduct,
  type AccountantProductPatch,
} from '@/api/accountant'

export const accountantKeys = {
  all: ['accountant'] as const,
  products: (params?: unknown) =>
    [...accountantKeys.all, 'products', params ?? {}] as const,
  sales: (params?: unknown) =>
    [...accountantKeys.all, 'reports', 'sales', params ?? {}] as const,
  topProducts: (params?: unknown) =>
    [...accountantKeys.all, 'reports', 'top-products', params ?? {}] as const,
  lowStock: (threshold?: number) =>
    [...accountantKeys.all, 'reports', 'low-stock', threshold ?? null] as const,
}

export function useAccountantProducts(params?: {
  search?: string
  category?: number | string
}) {
  return useQuery({
    queryKey: accountantKeys.products(params),
    queryFn: () => getAccountantProducts(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useUpdateAccountantProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: AccountantProductPatch
    }) => updateAccountantProduct(id, payload),
    onSuccess: () => {
      // A price/stock edit changes the product list and the low-stock report.
      queryClient.invalidateQueries({ queryKey: accountantKeys.all })
    },
  })
}

export function useAccountantSalesReport(params?: {
  date_from?: string
  date_to?: string
  branch?: number | string
}) {
  return useQuery({
    queryKey: accountantKeys.sales(params),
    queryFn: () => getAccountantSalesReport(params),
    staleTime: 60 * 1000,
  })
}

export function useAccountantTopProducts(params?: {
  date_from?: string
  date_to?: string
  limit?: number
}) {
  return useQuery({
    queryKey: accountantKeys.topProducts(params),
    queryFn: () => getAccountantTopProducts(params),
    staleTime: 60 * 1000,
  })
}

export function useAccountantLowStock(threshold?: number) {
  return useQuery({
    queryKey: accountantKeys.lowStock(threshold),
    queryFn: () => getAccountantLowStock({ threshold }),
    staleTime: 60 * 1000,
  })
}
