import { useTranslation } from 'react-i18next'
import { Truck } from 'lucide-react'

import { useMinFreeDelivery } from '@/features/branchDashboard/queries'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

interface FreeDeliveryAlertProps {
  /** The order total, compared against this branch's threshold. */
  total: string
  /** `compact` drops the reminder line — for use inside the fee form. */
  variant?: 'full' | 'compact'
  className?: string
}

/**
 * Flags an order that qualifies for this branch's free-delivery offer, so
 * the manager doesn't charge shipping on it by mistake.
 *
 * The backend never applies the threshold itself — `shipping_fee` is always
 * entered by hand — so this is purely a reminder. Renders nothing when the
 * branch has no threshold set or the order is below it.
 */
export function FreeDeliveryAlert({
  total,
  variant = 'full',
  className,
}: FreeDeliveryAlertProps) {
  const { t, i18n } = useTranslation()
  const { data } = useMinFreeDelivery()

  const raw = data?.min_free_delivery_amount
  if (raw == null || raw === '') return null

  const threshold = parseFloat(raw)
  const orderTotal = parseFloat(total)
  if (Number.isNaN(threshold) || threshold <= 0) return null
  if (Number.isNaN(orderTotal) || orderTotal < threshold) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3',
        className,
      )}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          {t('dashboard.branch.freeDelivery.orderEligible')}
        </p>
        <p className="text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
          {t('dashboard.branch.freeDelivery.orderEligibleDetail', {
            total: formatPrice(orderTotal, i18n.language),
            threshold: formatPrice(threshold, i18n.language),
          })}
        </p>
        {variant === 'full' && (
          <p className="pt-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            {t('dashboard.branch.freeDelivery.feeReminder')}
          </p>
        )}
      </div>
    </div>
  )
}
