import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Phone, User as UserIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { formatDate, formatPrice } from '@/lib/format'
import type { BranchOrderListItem } from '@/types/api'

interface BranchOrderRowProps {
  order: BranchOrderListItem
}

export function BranchOrderRow({ order }: BranchOrderRowProps) {
  const { t, i18n } = useTranslation()

  return (
    <Link
      to={`/dashboard/branch/orders/${order.id}`}
      className="block group"
    >
      <Card className="gap-3 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {t('orders.orderNumber', { id: order.id })}
              </span>
              <div className="flex items-center gap-1.5">
                <UserIcon className="size-4 text-muted-foreground" />
                <span className="text-base font-semibold">
                  {order.customer_name || t('dashboard.branch.unnamedCustomer')}
                </span>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <a
              href={`tel:${order.customer_phone}`}
              dir="ltr"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="size-4 shrink-0" />
              <span className="font-medium">{order.customer_phone}</span>
            </a>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" />
              <span>{formatDate(order.created_at, i18n.language)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <div className="text-xs text-muted-foreground">
              {t('orders.deposit')}:{' '}
              <span className="font-medium text-foreground">
                {formatPrice(order.deposit_amount, i18n.language)}{' '}
                {t('common.currency')}
              </span>
            </div>
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
