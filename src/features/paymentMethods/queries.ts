import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBranchPaymentMethod,
  deleteBranchPaymentMethod,
  getBranchPaymentMethods,
  getPaymentMethods,
  updateBranchPaymentMethod,
} from '@/api/paymentMethods'
import type { PaymentMethodPayload } from '@/types/api'

const pmKeys = {
  all: ['paymentMethods'] as const,
  public: (cityId?: number | string) => [...pmKeys.all, 'public', cityId ?? ''] as const,
  branch: () => [...pmKeys.all, 'branch'] as const,
}

export function usePaymentMethods(cityId?: number | string) {
  return useQuery({
    queryKey: pmKeys.public(cityId),
    queryFn: () => getPaymentMethods(cityId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBranchPaymentMethods() {
  return useQuery({
    queryKey: pmKeys.branch(),
    queryFn: getBranchPaymentMethods,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBranchPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PaymentMethodPayload) => createBranchPaymentMethod(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pmKeys.branch() }),
  })
}

export function useUpdateBranchPaymentMethod(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<PaymentMethodPayload>) =>
      updateBranchPaymentMethod(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: pmKeys.branch() }),
  })
}

export function useDeleteBranchPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => deleteBranchPaymentMethod(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: pmKeys.branch() }),
  })
}
