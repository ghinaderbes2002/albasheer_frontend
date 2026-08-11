import { useTranslation } from 'react-i18next'
import { Truck } from 'lucide-react'

import { formatPrice } from '@/lib/format'
import type { City } from '@/types/api'

interface FreeDeliveryNoteProps {
  /** The city the customer picked — its branch owns the threshold. */
  city?: City
  /** Current cart subtotal, used to show how much is still missing. */
  subtotal: number
}

/**
 * "Free delivery over $X" for the selected city's branch.
 *
 * The threshold is informational: the backend does not recalculate
 * `shipping_fee` from it, so this never changes the totals shown. Renders
 * nothing when the branch hasn't set a value.
 */
export function FreeDeliveryNote({ city, subtotal }: FreeDeliveryNoteProps) {
  const { t, i18n } = useTranslation()

  const raw = city?.min_free_delivery_amount
  if (raw == null || raw === '') return null

  const threshold = parseFloat(raw)
  if (Number.isNaN(threshold) || threshold <= 0) return null

  const reached = subtotal >= threshold
  const remaining = threshold - subtotal

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
        reached
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
          : 'border-primary/25 bg-primary/5 text-muted-foreground'
      }`}
    >
      <Truck className="mt-0.5 size-3.5 shrink-0" />
      <span>
        {reached
          ? t('cart.freeDelivery.reached')
          : t('cart.freeDelivery.remaining', {
              amount: formatPrice(remaining, i18n.language),
              threshold: formatPrice(threshold, i18n.language),
            })}
      </span>
    </div>
  )
}
