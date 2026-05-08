import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin, Package } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
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
      <Card className="gap-3 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {t('orders.orderNumber', { id: order.id })}
              </span>
              <span className="text-base font-semibold">
                {order.branch_name}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Package className="size-4 shrink-0" />
              <span>
                {t('orders.itemCount', { count: order.item_count })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" />
              <span>{formatDate(order.created_at, i18n.language)}</span>
            </div>
            <div className="flex items-start gap-1.5 sm:col-span-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-1">{order.delivery_address}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">
              {t('orders.total')}
            </span>
            <div className="flex items-baseline gap-1.5 text-primary">
              <span className="text-lg font-bold">
                {formatPrice(order.total_price, i18n.language)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('common.currency')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
