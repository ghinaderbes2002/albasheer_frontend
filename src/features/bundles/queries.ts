import { useQuery } from '@tanstack/react-query'
import { getBundle, getBundles } from '@/api/bundles'

export const bundleKeys = {
  all: ['bundles'] as const,
  list: () => [...bundleKeys.all, 'list'] as const,
  detail: (id: number | string) =>
    [...bundleKeys.all, 'detail', id] as const,
}

export function useBundles() {
  return useQuery({
    queryKey: bundleKeys.list(),
    queryFn: getBundles,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBundle(id: number | string | undefined) {
  return useQuery({
    queryKey: bundleKeys.detail(id ?? ''),
    queryFn: () => getBundle(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 5 * 60 * 1000,
  })
}
