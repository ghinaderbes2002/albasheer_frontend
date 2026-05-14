import { api } from '@/lib/api'
import type { PaginatedResponse, PaymentMethod, PaymentMethodPayload } from '@/types/api'

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

// Public — used in checkout
export async function getPaymentMethods(cityId?: number | string): Promise<PaymentMethod[]> {
  const { data } = await api.get<PaymentMethod[] | PaginatedResponse<PaymentMethod>>(
    '/api/payment-methods/',
    { params: cityId ? { city: cityId } : undefined },
  )
  return unwrap(data)
}

// Branch manager — manage their branch's methods
export async function getBranchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await api.get<PaymentMethod[] | PaginatedResponse<PaymentMethod>>(
    '/api/branch/payment-methods/',
  )
  return unwrap(data)
}

export async function createBranchPaymentMethod(
  payload: PaymentMethodPayload,
): Promise<PaymentMethod> {
  const { data } = await api.post<PaymentMethod>('/api/branch/payment-methods/', payload)
  return data
}

export async function updateBranchPaymentMethod(
  id: number | string,
  payload: Partial<PaymentMethodPayload>,
): Promise<PaymentMethod> {
  const { data } = await api.patch<PaymentMethod>(
    `/api/branch/payment-methods/${id}/`,
    payload,
  )
  return data
}

export async function deleteBranchPaymentMethod(id: number | string): Promise<void> {
  await api.delete(`/api/branch/payment-methods/${id}/`)
}
