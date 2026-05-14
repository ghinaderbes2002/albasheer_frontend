import { api } from '@/lib/api'
import type {
  AssignDeliveryPayload,
  BranchOrderDetail,
  BranchOrderListItem,
  DeliveryStaff,
  OrderStatus,
  PaginatedResponse,
  RejectOrderPayload,
} from '@/types/api'

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export interface BranchOrdersParams {
  status?: OrderStatus
}

export async function getBranchOrders(
  params: BranchOrdersParams = {},
): Promise<BranchOrderListItem[]> {
  const { data } = await api.get<
    BranchOrderListItem[] | PaginatedResponse<BranchOrderListItem>
  >('/api/branch/orders/', { params })
  return unwrap(data)
}

export async function getBranchOrder(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.get<BranchOrderDetail>(
    `/api/branch/orders/${id}/`,
  )
  return data
}

export async function confirmBranchOrder(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/branch/orders/${id}/confirm/`,
  )
  return data
}

export async function rejectBranchOrder(
  id: number | string,
  payload: RejectOrderPayload,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/branch/orders/${id}/reject/`,
    payload,
  )
  return data
}

export async function prepareBranchOrder(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/branch/orders/${id}/prepare/`,
  )
  return data
}

export async function assignBranchDelivery(
  id: number | string,
  payload: AssignDeliveryPayload,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/branch/orders/${id}/assign-delivery/`,
    payload,
  )
  return data
}

export async function markBranchOrderReady(
  id: number | string,
): Promise<BranchOrderDetail> {
  const { data } = await api.post<BranchOrderDetail>(
    `/api/branch/orders/${id}/ready/`,
  )
  return data
}

export async function getBranchDeliveryStaff(): Promise<DeliveryStaff[]> {
  const { data } = await api.get<DeliveryStaff[] | PaginatedResponse<DeliveryStaff>>(
    '/api/branch/delivery-staff/',
  )
  return Array.isArray(data) ? data : data.results
}

export async function setShippingFee(
  id: number | string,
  shippingFee: number,
): Promise<BranchOrderDetail> {
  const { data } = await api.patch<BranchOrderDetail>(
    `/api/branch/orders/${id}/set-shipping-fee/`,
    { shipping_fee: shippingFee },
  )
  return data
}
