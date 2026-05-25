import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrder,
  getOrderTracking,
  getOrderRating,
  rateOrder,
  updateOrderStatus,
  uploadReceipt,
} from '@/api/orders'
import type {
  CreateOrderPayload,
  UpdateOrderStatusPayload,
} from '@/types/api'

export const orderKeys = {
  all: ['orders'] as const,
  myList: () => [...orderKeys.all, 'mine'] as const,
  detail: (id: number | string) =>
    [...orderKeys.all, 'detail', id] as const,
}

export function useMyOrders() {
  return useQuery({
    queryKey: orderKeys.myList(),
    queryFn: getMyOrders,
    staleTime: 30 * 1000,
  })
}

export function useHasPendingReceipt(enabled = true) {
  return useQuery({
    queryKey: [...orderKeys.myList(), 'pending-receipt'] as const,
    queryFn: getMyOrders,
    enabled,
    staleTime: 30 * 1000,
    select: (orders) =>
      orders.some(
        (o) => o.status === 'pending' && parseFloat(o.deposit_amount) > 0,
      ),
  })
}

export function useOrder(id: number | string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => getOrder(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 15 * 1000,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (order) => {
      // Cart cleanup is decided per-call by the page (full clear vs single
      // item removal), since checkout supports both whole-cart and per-row
      // purchases.
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.myList() })
    },
  })
}

export function useUploadReceipt(orderId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadReceipt(orderId, file),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(orderId), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.myList() })
    },
  })
}

export function useUpdateOrderStatus(orderId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) =>
      updateOrderStatus(orderId, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(orderId), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useOrderTracking(id: number | string | undefined) {
  return useQuery({
    queryKey: [...orderKeys.detail(id ?? ''), 'tracking'],
    queryFn: () => getOrderTracking(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  })
}

export function useCancelOrder(orderId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(orderId), order)
      queryClient.invalidateQueries({ queryKey: orderKeys.myList() })
    },
  })
}

export function useOrderRating(orderId: number | string | undefined) {
  return useQuery({
    queryKey: [...orderKeys.detail(orderId ?? ''), 'rating'],
    queryFn: () => getOrderRating(orderId as number | string),
    enabled: orderId !== undefined && orderId !== '',
    staleTime: 60 * 1000,
  })
}

export function useRateOrder(orderId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { rating: number; comment?: string }) =>
      rateOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...orderKeys.detail(orderId), 'rating'] })
    },
  })
}
