import { useMemo } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  completeDeliveryOrder,
  getDeliveryOrders,
  startDeliveryOrder,
} from '@/api/deliveryOrders'

export const deliveryOrderKeys = {
  all: ['deliveryOrders'] as const,
  list: () => [...deliveryOrderKeys.all, 'list'] as const,
}

export function useDeliveryOrders() {
  return useQuery({
    queryKey: deliveryOrderKeys.list(),
    queryFn: getDeliveryOrders,
    staleTime: 15 * 1000,
  })
}

/**
 * The backend has no per-order detail endpoint for the delivery role —
 * we slice the list query for the matching id.
 */
export function useDeliveryOrder(id: number | string | undefined) {
  const query = useDeliveryOrders()
  const order = useMemo(() => {
    if (id === undefined || id === '') return null
    const idNum = typeof id === 'string' ? Number(id) : id
    if (Number.isNaN(idNum)) return null
    return query.data?.find((o) => o.id === idNum) ?? null
  }, [query.data, id])
  return { ...query, data: order }
}

function useOrderMutation(
  orderId: number | string,
  fn: () => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      // The list query is the source of truth; refetch it.
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.all })
    },
    // Use orderId in the closure for clarity; suppress unused warning.
    meta: { orderId },
  })
}

export function useStartDelivery(orderId: number | string) {
  return useOrderMutation(orderId, () => startDeliveryOrder(orderId))
}

export function useCompleteDelivery(orderId: number | string) {
  return useOrderMutation(orderId, () => completeDeliveryOrder(orderId))
}
