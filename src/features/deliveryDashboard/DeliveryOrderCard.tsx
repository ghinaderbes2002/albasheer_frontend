import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { Price } from '@/components/shared/Price'
import type { BranchOrderDetail } from '@/types/api'

interface DeliveryOrderCardProps {
  order: BranchOrderDetail
}

export function DeliveryOrderCard({ order }: DeliveryOrderCardProps) {
  const { t } = useTranslation()
  const remaining = Math.max(
    parseFloat(order.total_price) - parseFloat(order.deposit_amount),
    0,
  )

  return (
    <Link
      to={`/dashboard/delivery/orders/${order.id}`}
      className="block group"
    >
      <Card className="gap-3 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {t('orders.orderNumber', { id: order.id })}
              </span>
              <span className="text-base font-semibold">
                {order.customer_name || t('dashboard.branch.unnamedCustomer')}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <a
            href={`tel:${order.customer_phone}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="size-4 shrink-0" />
            {order.customer_phone}
          </a>

          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">{order.delivery_address}</span>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">
              {t('dashboard.delivery.amountToCollect')}
            </span>
            <Price value={remaining} className="text-lg font-bold text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
