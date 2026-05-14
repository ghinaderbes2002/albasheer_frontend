import { api } from '@/lib/api'
import type { Ad, PaginatedResponse } from '@/types/api'

/**
 * Public — returns only active ads, sorted by `order` ascending.
 * Backend returns a plain array but we tolerate a paginated envelope
 * just in case (consistent with the rest of the API client).
 */
export async function getAds(): Promise<Ad[]> {
  const { data } = await api.get<Ad[] | PaginatedResponse<Ad>>('/api/ads/')
  return Array.isArray(data) ? data : data.results
}
