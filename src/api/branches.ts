import { api } from '@/lib/api'
import type { Branch, PaginatedResponse } from '@/types/api'

export async function getBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[] | PaginatedResponse<Branch>>(
    '/api/branches/',
  )
  return Array.isArray(data) ? data : data.results
}

export async function getBranch(id: number | string): Promise<Branch> {
  const { data } = await api.get<Branch>(`/api/branches/${id}/`)
  return data
}
