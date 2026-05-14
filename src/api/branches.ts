import { api } from '@/lib/api'
import type { Branch, City, DeliveryStaff, PaginatedResponse } from '@/types/api'

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

export async function getCities(): Promise<City[]> {
  const { data } = await api.get<City[] | PaginatedResponse<City>>(
    '/api/branches/cities/',
  )
  return Array.isArray(data) ? data : data.results
}

export async function getBranchDeliveryStaff(
  branchId: number | string,
): Promise<DeliveryStaff[]> {
  const { data } = await api.get<
    DeliveryStaff[] | PaginatedResponse<DeliveryStaff>
  >(`/api/branches/${branchId}/delivery-staff/`)
  return Array.isArray(data) ? data : data.results
}
