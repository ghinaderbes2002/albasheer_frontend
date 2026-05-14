import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/api/addresses'
import type { AddressPayload } from '@/types/api'

export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
}

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: getAddresses,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useUpdateAddress(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<AddressPayload>) => updateAddress(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
