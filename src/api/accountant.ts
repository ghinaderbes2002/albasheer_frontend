import { api } from '@/lib/api'
import type {
  AdminProduct,
  LowStockEntry,
  PaginatedResponse,
  SalesReportResponse,
  TopProductEntry,
} from '@/types/api'

/**
 * The accountant slice of the admin API. Read-only everywhere except
 * `price` / `stock_quantity` on a product — the backend rejects any other
 * field, so the UI must not offer one.
 */

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export async function getAccountantProducts(params?: {
  search?: string
  category?: number | string
}): Promise<AdminProduct[]> {
  const { data } = await api.get<AdminProduct[] | PaginatedResponse<AdminProduct>>(
    '/api/admin/accountant/products/',
    { params },
  )
  return unwrap(data)
}

export async function getAccountantProduct(
  id: number | string,
): Promise<AdminProduct> {
  const { data } = await api.get<AdminProduct>(
    `/api/admin/accountant/products/${id}/`,
  )
  return data
}

export interface AccountantProductPatch {
  price?: string
  stock_quantity?: number
}

export async function updateAccountantProduct(
  id: number | string,
  payload: AccountantProductPatch,
): Promise<AdminProduct> {
  const { data } = await api.patch<AdminProduct>(
    `/api/admin/accountant/products/${id}/`,
    payload,
  )
  return data
}

// ─── Reports ──────────────────────────────────────────────────────────
// Same handlers as the admin reports — the numbers are guaranteed to match.
export async function getAccountantSalesReport(params?: {
  date_from?: string
  date_to?: string
  branch?: number | string
}): Promise<SalesReportResponse> {
  const { data } = await api.get<SalesReportResponse>(
    '/api/admin/accountant/reports/sales/',
    { params },
  )
  return data
}

export async function getAccountantTopProducts(params?: {
  date_from?: string
  date_to?: string
  limit?: number
}): Promise<TopProductEntry[]> {
  const { data } = await api.get<TopProductEntry[] | PaginatedResponse<TopProductEntry>>(
    '/api/admin/accountant/reports/top-products/',
    { params },
  )
  return unwrap(data)
}

export async function getAccountantLowStock(params?: {
  threshold?: number
}): Promise<LowStockEntry[]> {
  const { data } = await api.get<LowStockEntry[] | PaginatedResponse<LowStockEntry>>(
    '/api/admin/accountant/reports/low-stock/',
    { params },
  )
  return unwrap(data)
}
