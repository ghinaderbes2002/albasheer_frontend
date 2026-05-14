import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  assignBranchDelivery,
  confirmBranchOrder,
  getBranchOrder,
  getBranchOrders,
  markBranchOrderReady,
  prepareBranchOrder,
  rejectBranchOrder,
  setShippingFee,
  type BranchOrdersParams,
} from '@/api/branchOrders'
import type {
  AssignDeliveryPayload,
  RejectOrderPayload,
} from '@/types/api'

export const branchOrderKeys = {
  all: ['branchOrders'] as const,
  list: (params: BranchOrdersParams) =>
    [...branchOrderKeys.all, 'list', params] as const,
  detail: (id: number | string) =>
    [...branchOrderKeys.all, 'detail', id] as const,
}

export function useBranchOrders(params: BranchOrdersParams = {}) {
  return useQuery({
    queryKey: branchOrderKeys.list(params),
    queryFn: () => getBranchOrders(params),
    staleTime: 15 * 1000,
    placeholderData: (prev) => prev,
  })
}

export function useBranchOrder(id: number | string | undefined) {
  return useQuery({
    queryKey: branchOrderKeys.detail(id ?? ''),
    queryFn: () => getBranchOrder(id as number | string),
    enabled: id !== undefined && id !== '',
    staleTime: 10 * 1000,
  })
}

/**
 * Helper that wires up a mutation against a single order — refreshes
 * both the detail and any cached list queries on success.
 */
function useOrderMutation<TVars>(
  orderId: number | string,
  fn: (vars: TVars) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      queryClient.setQueryData(branchOrderKeys.detail(orderId), data)
      queryClient.invalidateQueries({ queryKey: branchOrderKeys.all })
    },
  })
}

export function useConfirmBranchOrder(orderId: number | string) {
  return useOrderMutation(orderId, () => confirmBranchOrder(orderId))
}

export function useRejectBranchOrder(orderId: number | string) {
  return useOrderMutation(orderId, (payload: RejectOrderPayload) =>
    rejectBranchOrder(orderId, payload),
  )
}

export function usePrepareBranchOrder(orderId: number | string) {
  return useOrderMutation(orderId, () => prepareBranchOrder(orderId))
}

export function useAssignBranchDelivery(orderId: number | string) {
  return useOrderMutation(orderId, (payload: AssignDeliveryPayload) =>
    assignBranchDelivery(orderId, payload),
  )
}

export function useMarkBranchOrderReady(orderId: number | string) {
  return useOrderMutation(orderId, () => markBranchOrderReady(orderId))
}

export function useSetShippingFee(orderId: number | string) {
  return useOrderMutation(orderId, (fee: number) =>
    setShippingFee(orderId, fee),
  )
}
