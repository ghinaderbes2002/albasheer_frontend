import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  assignBranchDelivery,
  confirmBranchOrder,
  createBranchStaff,
  deleteBranchStaff,
  getBranchDeliveryStaff,
  getBranchOrder,
  getBranchOrders,
  getMinFreeDelivery,
  listBranchStaff,
  markBranchOrderReady,
  prepareBranchOrder,
  rejectBranchOrder,
  setMinFreeDelivery,
  setShippingFee,
  updateBranchStaff,
  type BranchOrdersParams,
} from '@/api/branchOrders'
import { updateOrderStatus } from '@/api/orders'
import type {
  AssignDeliveryPayload,
  CreateBranchStaffPayload,
  RejectOrderPayload,
} from '@/types/api'

export const branchOrderKeys = {
  all: ['branchOrders'] as const,
  list: (params: BranchOrdersParams) =>
    [...branchOrderKeys.all, 'list', params] as const,
  // Stringified: route params arrive as `"25"` and record ids as `25`, and a
  // strict key comparison would treat those as two different orders.
  detail: (id: number | string) =>
    [...branchOrderKeys.all, 'detail', String(id)] as const,
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

/**
 * Same transition as `useMarkBranchOrderReady` (confirmed → shipping) but
 * carrying an estimated delivery time.
 *
 * Stopgap: `/api/branch/orders/<id>/ready/` ignores its request body, so the
 * generic status endpoint is the only one that stores `estimated_delivery`.
 * It skips the "a delivery employee must be assigned" check that `ready/`
 * enforces, so `OrderActions` blocks the button until one is assigned.
 * Drop this once the backend accepts the field on `ready/`.
 */
export function useShipBranchOrderWithEta(orderId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (estimatedDelivery: string) =>
      updateOrderStatus(orderId, {
        status: 'shipping',
        estimated_delivery: estimatedDelivery,
      }),
    // Responds with the customer-shaped `OrderDetail`, not `BranchOrderDetail`
    // — refetch instead of seeding the branch cache with the wrong shape.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: branchOrderKeys.all }),
  })
}

export function useSetShippingFee(orderId: number | string) {
  return useOrderMutation(orderId, (fee: number) =>
    setShippingFee(orderId, fee),
  )
}

export function useBranchDeliveryStaffList() {
  return useQuery({
    queryKey: [...branchOrderKeys.all, 'delivery-staff'] as const,
    queryFn: getBranchDeliveryStaff,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Free-delivery threshold ──────────────────────────────────────────
const minFreeDeliveryKey = ['branchMinFreeDelivery'] as const

export function useMinFreeDelivery(enabled = true) {
  return useQuery({
    queryKey: minFreeDeliveryKey,
    queryFn: getMinFreeDelivery,
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSetMinFreeDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (amount: string | null) => setMinFreeDelivery(amount),
    onSuccess: (data) => {
      queryClient.setQueryData(minFreeDeliveryKey, data)
      // The public city list carries the same number to customers.
      queryClient.invalidateQueries({ queryKey: ['branches'] })
    },
  })
}

const staffKeys = {
  all: ['branchStaff'] as const,
  list: () => [...staffKeys.all, 'list'] as const,
}

export function useBranchStaffList() {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: listBranchStaff,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBranchStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBranchStaffPayload) => createBranchStaff(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  })
}

export function useUpdateBranchStaff(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<CreateBranchStaffPayload>) => updateBranchStaff(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  })
}

export function useDeleteBranchStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBranchStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  })
}
