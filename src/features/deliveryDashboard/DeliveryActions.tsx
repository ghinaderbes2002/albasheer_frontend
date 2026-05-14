import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, CheckCircle2, Loader2, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  useCompleteDelivery,
  useStartDelivery,
} from '@/features/deliveryDashboard/queries'
import { extractApiError } from '@/lib/api'
import type { BranchOrderDetail } from '@/types/api'

interface DeliveryActionsProps {
  order: BranchOrderDetail
}

export function DeliveryActions({ order }: DeliveryActionsProps) {
  const { t } = useTranslation()
  const start = useStartDelivery(order.id)
  const complete = useCompleteDelivery(order.id)
  const [confirming, setConfirming] = useState(false)

  const handleStart = async () => {
    try {
      await start.mutateAsync()
      toast.success(t('dashboard.delivery.actions.started'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleComplete = async () => {
    try {
      await complete.mutateAsync()
      toast.success(t('dashboard.delivery.actions.completed'))
      setConfirming(false)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  if (order.status === 'preparing') {
    return (
      <Button
        type="button"
        size="lg"
        onClick={handleStart}
        disabled={start.isPending}
        className="w-full sm:w-auto"
      >
        {start.isPending ? <Loader2 className="animate-spin" /> : <Truck />}
        {t('dashboard.delivery.actions.start')}
      </Button>
    )
  }

  if (order.status === 'shipping') {
    if (confirming) {
      return (
        <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-sm font-medium">
            {t('dashboard.delivery.confirmComplete.question')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.delivery.confirmComplete.hint')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleComplete}
              disabled={complete.isPending}
            >
              {complete.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              {t('dashboard.delivery.actions.confirmComplete')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={complete.isPending}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Button
        type="button"
        size="lg"
        onClick={() => setConfirming(true)}
        className="w-full sm:w-auto"
      >
        <CheckCircle2 />
        {t('dashboard.delivery.actions.complete')}
      </Button>
    )
  }

  if (order.status === 'delivered') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Check className="size-4" />
        {t('dashboard.delivery.actions.delivered')}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
      {t('dashboard.delivery.actions.noActions')}
    </div>
  )
}
