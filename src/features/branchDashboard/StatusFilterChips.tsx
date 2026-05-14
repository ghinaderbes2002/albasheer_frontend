import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

export type StatusFilter = OrderStatus | 'all'

interface StatusFilterChipsProps {
  value: StatusFilter
  onChange: (next: StatusFilter) => void
  /**
   * Optional list of available status filters. Default covers the full
   * lifecycle for the branch view.
   */
  statuses?: StatusFilter[]
}

const DEFAULT_STATUSES: StatusFilter[] = [
  'all',
  'pending',
  'confirmed',
  'preparing',
  'shipping',
  'delivered',
  'cancelled',
]

export function StatusFilterChips({
  value,
  onChange,
  statuses = DEFAULT_STATUSES,
}: StatusFilterChipsProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => {
        const isActive = value === s
        const label = s === 'all' ? t('common.all') : t(`status.${s}`)
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
