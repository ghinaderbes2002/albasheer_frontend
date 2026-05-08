import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createOrder,
  getBranchOrders,
  getDeliveryOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  uploadReceipt,
} from '@/api/orders'
import { useCartStore } from '@/store/cart'
import type {
  CreateOrderPayload,
  UpdateOrderStatusPayload,
} from '@/types/api'

export const orderKeys = {
  all: ['orders'] as const,
  myList: () => [...orderKeys.all, 'mine'] as const,
  branchList: () => [...orderKeys.all, 'branch'] as const,
  deliveryList: () => [...orderKeys.all, 'delivery'] as const,
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
  const clearCart = useCartStore((s) => s.clear)
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (order) => {
      clearCart()
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

// ─── Staff (Phase 5/6) ────────────────────────────────────────────────
export function useBranchOrders() {
  return useQuery({
    queryKey: orderKeys.branchList(),
    queryFn: getBranchOrders,
    staleTime: 30 * 1000,
  })
}

export function useDeliveryOrders() {
  return useQuery({
    queryKey: orderKeys.deliveryList(),
    queryFn: getDeliveryOrders,
    staleTime: 30 * 1000,
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
