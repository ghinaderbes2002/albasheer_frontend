import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBranchDeliveryStaffList } from '@/features/branchDashboard/queries'
import {
  Check,
  Loader2,
  Package,
  Truck,
  TruckIcon,
  UserPlus,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useAssignBranchDelivery,
  useConfirmBranchOrder,
  useMarkBranchOrderReady,
  useRejectBranchOrder,
  useSetShippingFee,
} from '@/features/branchDashboard/queries'
import { extractApiError } from '@/lib/api'
import type { BranchOrderDetail } from '@/types/api'

interface OrderActionsProps {
  order: BranchOrderDetail
}

type Mode = 'idle' | 'reject' | 'assign' | 'shipping-fee'

export function OrderActions({ order }: OrderActionsProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('idle')

  const confirm = useConfirmBranchOrder(order.id)
  const reject = useRejectBranchOrder(order.id)
  const assign = useAssignBranchDelivery(order.id)
  const ready = useMarkBranchOrderReady(order.id)
  const shippingFee = useSetShippingFee(order.id)

  const anyPending =
    confirm.isPending ||
    reject.isPending ||
    assign.isPending ||
    ready.isPending ||
    shippingFee.isPending

  const run = async (
    fn: () => Promise<unknown>,
    successMsg: string,
    onDone?: () => void,
  ) => {
    try {
      await fn()
      toast.success(successMsg)
      onDone?.()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  if (mode === 'reject') {
    return (
      <RejectForm
        loading={reject.isPending}
        onCancel={() => setMode('idle')}
        onSubmit={(reason) =>
          run(
            () => reject.mutateAsync({ rejection_reason: reason }),
            t('dashboard.branch.actions.rejected'),
            () => setMode('idle'),
          )
        }
      />
    )
  }

  if (mode === 'assign') {
    return (
      <AssignForm
        loading={assign.isPending}
        onCancel={() => setMode('idle')}
        onSubmit={(staffId) =>
          run(
            () => assign.mutateAsync({ delivery_staff_id: staffId }),
            t('dashboard.branch.actions.assigned'),
            () => setMode('idle'),
          )
        }
      />
    )
  }

  if (mode === 'shipping-fee') {
    return (
      <ShippingFeeForm
        loading={shippingFee.isPending}
        onCancel={() => setMode('idle')}
        onSubmit={(fee) =>
          run(
            () => shippingFee.mutateAsync(fee),
            t('dashboard.branch.actions.shippingFeeSet'),
            () => setMode('idle'),
          )
        }
      />
    )
  }

  // ─── Status-driven action buttons ──────────────────────────────────
  const buttons: React.ReactNode[] = []

  if (order.status === 'pending') {
    buttons.push(
      <Button
        key="confirm"
        type="button"
        size="lg"
        disabled={anyPending}
        onClick={() =>
          run(
            () => confirm.mutateAsync(undefined as never),
            t('dashboard.branch.actions.confirmed'),
          )
        }
      >
        {confirm.isPending ? <Loader2 className="animate-spin" /> : <Check />}
        {t('dashboard.branch.actions.confirm')}
      </Button>,
      <Button
        key="reject"
        type="button"
        variant="outline"
        size="lg"
        disabled={anyPending}
        onClick={() => setMode('reject')}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X />
        {t('dashboard.branch.actions.reject')}
      </Button>,
    )
  } else if (order.status === 'confirmed' || order.status === 'preparing') {
    buttons.push(
      <Button
        key="assign"
        type="button"
        variant="outline"
        size="lg"
        disabled={anyPending}
        onClick={() => setMode('assign')}
      >
        <UserPlus />
        {t('dashboard.branch.actions.assign')}
      </Button>,
      <Button
        key="shipping-fee"
        type="button"
        variant="outline"
        size="lg"
        disabled={anyPending}
        onClick={() => setMode('shipping-fee')}
      >
        <TruckIcon />
        {t('dashboard.branch.actions.setShippingFee')}
      </Button>,
      <Button
        key="ready"
        type="button"
        size="lg"
        disabled={anyPending}
        onClick={() =>
          run(
            () => ready.mutateAsync(undefined as never),
            t('dashboard.branch.actions.readied'),
          )
        }
      >
        {ready.isPending ? <Loader2 className="animate-spin" /> : <Truck />}
        {t('dashboard.branch.actions.ready')}
      </Button>,
      <Button
        key="reject"
        type="button"
        variant="outline"
        size="lg"
        disabled={anyPending}
        onClick={() => setMode('reject')}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X />
        {t('dashboard.branch.actions.reject')}
      </Button>,
    )
  }

  if (buttons.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Package className="size-4" />
        {t('dashboard.branch.actions.noActions')}
      </div>
    )
  }

  return <div className="flex flex-wrap gap-2">{buttons}</div>
}

// ──────────────────────────────────────────────────────────────────────
// Inline forms
// ──────────────────────────────────────────────────────────────────────

interface RejectFormProps {
  loading: boolean
  onCancel: () => void
  onSubmit: (reason: string) => void
}

function RejectForm({ loading, onCancel, onSubmit }: RejectFormProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  return (
    <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <Label htmlFor="rejection_reason">
        <X className="size-3.5 text-destructive" />
        {t('dashboard.branch.reject.reasonLabel')}
      </Label>
      <Textarea
        id="rejection_reason"
        rows={3}
        autoFocus
        placeholder={t('dashboard.branch.reject.reasonPlaceholder')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={loading}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={!trimmed || loading}
          onClick={() => onSubmit(trimmed)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <X />}
          {t('dashboard.branch.actions.confirmReject')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

interface ShippingFeeFormProps {
  loading: boolean
  onCancel: () => void
  onSubmit: (fee: number) => void
}

function ShippingFeeForm({ loading, onCancel, onSubmit }: ShippingFeeFormProps) {
  const { t } = useTranslation()
  const [fee, setFee] = useState('')
  const parsed = parseFloat(fee)
  const valid = !Number.isNaN(parsed) && parsed >= 0

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <Label htmlFor="shipping_fee">
        <TruckIcon className="size-3.5 text-primary" />
        {t('dashboard.branch.shippingFee.label')}
      </Label>
      <Input
        id="shipping_fee"
        type="number"
        inputMode="decimal"
        min={0}
        autoFocus
        dir="ltr"
        placeholder="0"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        disabled={loading}
      />
      <p className="text-xs text-muted-foreground">
        {t('dashboard.branch.shippingFee.hint')}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!valid || loading}
          onClick={() => onSubmit(parsed)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check />}
          {t('dashboard.branch.shippingFee.confirm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

interface AssignFormProps {
  loading: boolean
  onCancel: () => void
  onSubmit: (staffId: number) => void
}

function AssignForm({ loading, onCancel, onSubmit }: AssignFormProps) {
  const { t } = useTranslation()
  const {
    data: staff,
    isLoading: staffLoading,
    isError: staffError,
  } = useBranchDeliveryStaffList()
  const [selected, setSelected] = useState('')

  const parsed = parseInt(selected, 10)
  const valid = !Number.isNaN(parsed) && parsed > 0

  const displayName = (s: { first_name: string; last_name: string; phone: string }) => {
    const name = [s.first_name, s.last_name].filter(Boolean).join(' ')
    return name || s.phone
  }

  // Fallback to manual input when endpoint isn't available yet or branchId is missing
  const useManualInput = staffError || (!staffLoading && (!staff || staff.length === 0))

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <Label htmlFor="delivery_user_id">
        <UserPlus className="size-3.5 text-primary" />
        {t('dashboard.branch.assign.label')}
      </Label>

      {staffLoading ? (
        <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t('common.loading')}
        </div>
      ) : useManualInput ? (
        <>
          {staffError && (
            <p className="text-xs text-muted-foreground">
              {t('dashboard.branch.assign.manualFallback')}
            </p>
          )}
          <Input
            id="delivery_user_id"
            type="number"
            inputMode="numeric"
            min={1}
            autoFocus
            dir="ltr"
            placeholder={t('dashboard.branch.assign.manualPlaceholder')}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loading}
          />
        </>
      ) : (
        <select
          id="delivery_user_id"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t('dashboard.branch.assign.placeholder')}</option>
          {staff!.map((s) => (
            <option key={s.id} value={s.id}>
              {displayName(s)}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!valid || loading || staffLoading}
          onClick={() => onSubmit(parsed)}
        >
          {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {t('dashboard.branch.actions.confirmAssign')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}
