import { useQuery } from '@tanstack/react-query'
import { getBranch, getBranchDeliveryStaff, getBranches, getCities } from '@/api/branches'

export const branchesKeys = {
  all: ['branches'] as const,
  list: () => [...branchesKeys.all, 'list'] as const,
  detail: (id: number | string) =>
    [...branchesKeys.all, 'detail', id] as const,
  cities: () => [...branchesKeys.all, 'cities'] as const,
  deliveryStaff: (branchId: number | string) =>
    [...branchesKeys.all, 'delivery-staff', branchId] as const,
}

export function useBranches() {
  return useQuery({
    queryKey: branchesKeys.list(),
    queryFn: getBranches,
    staleTime: 10 * 60 * 1000,
  })
}

export function useBranch(id: number | string | undefined) {
  return useQuery({
    queryKey: branchesKeys.detail(id ?? ''),
    queryFn: () => getBranch(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 10 * 60 * 1000,
  })
}

export function useCities() {
  return useQuery({
    queryKey: branchesKeys.cities(),
    queryFn: getCities,
    staleTime: 30 * 60 * 1000,
  })
}

export function useBranchDeliveryStaff(branchId: number | string | undefined) {
  return useQuery({
    queryKey: branchesKeys.deliveryStaff(branchId ?? ''),
    queryFn: () => getBranchDeliveryStaff(branchId as number | string),
    enabled: !!branchId,
    staleTime: 2 * 60 * 1000,
  })
}
