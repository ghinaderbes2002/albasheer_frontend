import { api } from '@/lib/api'
import type { Bundle, PaginatedResponse } from '@/types/api'

export async function getBundles(): Promise<Bundle[]> {
  const { data } = await api.get<Bundle[] | PaginatedResponse<Bundle>>(
    '/api/products/bundles/',
  )
  return Array.isArray(data) ? data : data.results
}

export async function getBundle(id: number | string): Promise<Bundle> {
  const { data } = await api.get<Bundle>(`/api/products/bundles/${id}/`)
  return data
}
