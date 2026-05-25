import { api } from '@/lib/api'
import type {
  AdminUser,
  AssignDeliveryPayload,
  BranchOrderDetail,
  BranchOrderListItem,
  CreateBranchStaffPayload,
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

export async function listBranchStaff(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[] | PaginatedResponse<AdminUser>>(
    '/api/admin/users/',
    { params: { role: 'delivery' } },
  )
  return Array.isArray(data) ? data : data.results
}

export async function createBranchStaff(payload: CreateBranchStaffPayload): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>('/api/admin/users/', {
    ...payload,
    role: 'delivery',
  })
  return data
}

export async function updateBranchStaff(id: number, payload: Partial<CreateBranchStaffPayload>): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/admin/users/${id}/`, payload)
  return data
}

export async function deleteBranchStaff(id: number): Promise<void> {
  await api.delete(`/api/admin/users/${id}/`)
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
