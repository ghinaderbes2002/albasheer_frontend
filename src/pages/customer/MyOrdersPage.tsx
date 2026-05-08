import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderCard } from '@/features/orders/OrderCard'
import { useMyOrders } from '@/features/orders/queries'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const STATUS_FILTERS: { value: OrderStatus | 'all'; key: string }[] = [
  { value: 'all', key: 'common.all' },
  { value: 'pending', key: 'status.pending' },
  { value: 'confirmed', key: 'status.confirmed' },
  { value: 'preparing', key: 'status.preparing' },
  { value: 'shipping', key: 'status.shipping' },
  { value: 'delivered', key: 'status.delivered' },
  { value: 'cancelled', key: 'status.cancelled' },
]

export function MyOrdersPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const { data, isLoading, isError } = useMyOrders()

  const visible = (data ?? []).filter((o) =>
    filter === 'all' ? true : o.status === filter,
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('nav.myOrders')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('orders.subtitle')}
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              filter === s.value
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {t(s.key)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Package className="size-10" />
          <p>{t('errors.generic')}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Package className="size-10" />
          <p>
            {(data?.length ?? 0) === 0
              ? t('orders.empty')
              : t('orders.emptyForFilter')}
          </p>
          <Button asChild className="mt-3">
            <Link to="/products">{t('home.featured.viewAll')}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}
