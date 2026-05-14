import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bike } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { DeliveryOrderCard } from '@/features/deliveryDashboard/DeliveryOrderCard'
import {
  StatusFilterChips,
  type StatusFilter,
} from '@/features/branchDashboard/StatusFilterChips'
import { useDeliveryOrders } from '@/features/deliveryDashboard/queries'

const DELIVERY_STATUSES: StatusFilter[] = [
  'all',
  'preparing',
  'shipping',
  'delivered',
]

export function DeliveryOrdersPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const { data, isLoading, isError } = useDeliveryOrders()

  const visible = useMemo(() => {
    if (!data) return []
    if (filter === 'all') return data
    return data.filter((o) => o.status === filter)
  }, [data, filter])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('dashboard.delivery.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.delivery.subtitle')}
        </p>
      </header>

      <StatusFilterChips
        value={filter}
        onChange={setFilter}
        statuses={DELIVERY_STATUSES}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState message={t('errors.generic')} />
      ) : visible.length === 0 ? (
        <EmptyState
          message={
            (data?.length ?? 0) === 0
              ? t('dashboard.delivery.empty')
              : t('dashboard.delivery.emptyForFilter')
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <DeliveryOrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Bike className="size-10" />
      <p>{message}</p>
    </div>
  )
}
