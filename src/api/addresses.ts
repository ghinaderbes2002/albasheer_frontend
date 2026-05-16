import { api } from '@/lib/api'
import type { Address, AddressPayload } from '@/types/api'

export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>('/api/addresses/')
  return data
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await api.post<Address>('/api/addresses/', payload)
  return data
}

export async function updateAddress(
  id: number,
  payload: Partial<AddressPayload>,
): Promise<Address> {
  const { data } = await api.patch<Address>(`/api/addresses/${id}/`, payload)
  return data
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/api/addresses/${id}/`)
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const { data } = await api.post<Address>(`/api/addresses/${id}/set-default/`, {})
  return data
}
