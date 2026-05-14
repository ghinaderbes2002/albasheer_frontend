import { useQuery } from '@tanstack/react-query'
import { getAds } from '@/api/ads'

export const adsKeys = {
  all: ['ads'] as const,
  list: () => [...adsKeys.all, 'list'] as const,
}

export function useAds() {
  return useQuery({
    queryKey: adsKeys.list(),
    queryFn: getAds,
    // Ads change rarely — keep them around for a while.
    staleTime: 10 * 60 * 1000,
  })
}
