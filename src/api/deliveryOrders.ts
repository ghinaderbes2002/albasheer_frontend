import { api } from '@/lib/api'
import type {
  BranchOrderDetail,
  PaginatedResponse,
} from '@/types/api'

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

/**
 * Backend returns each item as the same shape as `BranchOrderDetailSerializer`,
 * so the list is already "detail-rich" — no separate `/api/delivery/orders/<id>/`
 * endpoint exists.
 */
export async function getDeliveryOrders(): Promise<BranchOrderDetail[]> {
  const { data } = await api.get<
    BranchOrderDetail[] | PaginatedResponse<BranchOrderDetail>
  >('/api/delivery/orders/')
  return unwrap(data)
}

export async function startDeliveryOrder(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/delivery/orders/${id}/start/`,
  )
  return data
}

export async function completeDeliveryOrder(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/delivery/orders/${id}/complete/`,
  )
  return data
}
