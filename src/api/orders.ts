import { api } from '@/lib/api'
import type {
  CreateOrderPayload,
  OrderDetail,
  OrderListItem,
  OrderTracking,
  PaginatedResponse,
  UpdateOrderStatusPayload,
} from '@/types/api'

function unwrap<T>(data: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export async function getMyOrders(): Promise<OrderListItem[]> {
  const { data } = await api.get<
    OrderListItem[] | PaginatedResponse<OrderListItem>
  >('/api/orders/')
  return unwrap(data)
}

export async function getOrder(id: number | string): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/api/orders/${id}/`)
  return data
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const { data } = await api.post<OrderDetail>('/api/orders/', payload)
  return data
}

export async function uploadReceipt(
  orderId: number | string,
  file: File,
): Promise<OrderDetail> {
  const formData = new FormData()
  formData.append('receipt', file)
  const { data } = await api.post<OrderDetail>(
    `/api/orders/${orderId}/upload-receipt/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
  return data
}

export async function updateOrderStatus(
  orderId: number | string,
  payload: UpdateOrderStatusPayload,
): Promise<OrderDetail> {
  const { data } = await api.patch<OrderDetail>(
    `/api/orders/${orderId}/status/`,
    payload,
  )
  return data
}

export async function getOrderTracking(
  orderId: number | string,
): Promise<OrderTracking> {
  const { data } = await api.get<OrderTracking>(
    `/api/orders/${orderId}/tracking/`,
  )
  return data
}

export async function cancelOrder(
  orderId: number | string,
): Promise<OrderDetail> {
  const { data } = await api.post<OrderDetail>(
    `/api/orders/${orderId}/cancel/`,
  )
  return data
}

export async function rateOrder(
  orderId: number | string,
  payload: { rating: number; comment?: string },
): Promise<void> {
  await api.post(`/api/orders/${orderId}/rate/`, payload)
}
