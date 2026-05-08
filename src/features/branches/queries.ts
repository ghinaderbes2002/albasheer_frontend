import { useQuery } from '@tanstack/react-query'
import { getBranch, getBranches } from '@/api/branches'

export const branchesKeys = {
  all: ['branches'] as const,
  list: () => [...branchesKeys.all, 'list'] as const,
  detail: (id: number | string) =>
    [...branchesKeys.all, 'detail', id] as const,
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
