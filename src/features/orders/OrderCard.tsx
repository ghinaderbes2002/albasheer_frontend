import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin, Package } from 'lucide-react'

import { StatusBadge } from '@/features/orders/StatusBadge'
import { formatDate, formatPrice } from '@/lib/format'
import type { OrderListItem } from '@/types/api'

interface OrderCardProps {
  order: OrderListItem
}

export function OrderCard({ order }: OrderCardProps) {
  const { t, i18n } = useTranslation()
  return (
    <Link to={`/orders/${order.id}`} className="block group">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/8">
        <div className="space-y-4 p-5">

          {/* Header: order ID + branch + status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex size-1.5 rounded-full bg-primary" />
                {t('orders.orderNumber', { id: order.id })}
              </span>
              <span className="text-base font-bold text-foreground">
                {order.branch_name}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Meta info */}
          <div className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Package className="size-3.5 shrink-0" />
              <span>{t('orders.itemCount', { count: order.item_count })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              <span>{formatDate(order.created_at, i18n.language)}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:col-span-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-1">{order.delivery_address}</span>
            </div>
          </div>

          {/* Total price — gold chip */}
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t('orders.total')}
            </span>
            <div className="inline-flex items-baseline gap-1 text-primary">
              <span className="text-xl font-extrabold tabular-nums">
                {formatPrice(order.total_price, i18n.language)}
              </span>
              <span className="text-xs font-semibold text-primary/60">
                {t('common.currency')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  )
}
