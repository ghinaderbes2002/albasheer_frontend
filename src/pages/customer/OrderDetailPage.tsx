import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Receipt, Truck } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { StatusTimeline } from '@/features/orders/StatusTimeline'
import { ReceiptUpload } from '@/features/orders/ReceiptUpload'
import { useOrder } from '@/features/orders/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatDate, formatDateTime, formatPrice } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function OrderDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError, error } = useOrder(id)
  const Sep = i18n.language.startsWith('ar') ? ChevronLeft : ChevronRight

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-7 w-48" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    if (status === 403) {
      return (
        <PagePlaceholder
          title="403"
          description={t('errors.forbidden')}
          cta={{ label: t('nav.myOrders'), to: '/orders' }}
        />
      )
    }
    return (
      <PagePlaceholder
        title="404"
        description={t('errors.notFound')}
        cta={{ label: t('nav.myOrders'), to: '/orders' }}
      />
    )
  }

  const receiptUrl = resolveMediaUrl(order.receipt_image)
  const canUpload = order.status === 'pending' && !order.receipt_image

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <nav
        aria-label="breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/orders" className="hover:text-foreground">
          {t('nav.myOrders')}
        </Link>
        <Sep className="size-4" />
        <span className="text-foreground">
          {t('orders.orderNumber', { id: order.id })}
        </span>
      </nav>

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold md:text-3xl">
            {t('orders.orderNumber', { id: order.id })}
          </h1>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(order.created_at, i18n.language)}
          </span>
        </div>
        <StatusBadge status={order.status} className="text-sm" />
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('orders.itemsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-baseline justify-between gap-3 border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="line-clamp-1 text-sm font-medium">
                      {it.product_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(it.unit_price, i18n.language)}{' '}
                      {t('common.currency')} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(it.subtotal, i18n.language)}{' '}
                    <span className="text-xs text-muted-foreground">
                      {t('common.currency')}
                    </span>
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="size-4" />
                {t('orders.deliveryTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                label={t('orders.branch')}
                value={order.branch_name}
              />
              <Row
                label={t('orders.address')}
                value={order.delivery_address}
              />
              {order.customer_note && (
                <Row
                  label={t('orders.note')}
                  value={order.customer_note}
                />
              )}
              {order.delivery_staff_name && (
                <Row
                  label={t('orders.deliveryStaff')}
                  value={order.delivery_staff_name}
                />
              )}
              {order.estimated_delivery && (
                <Row
                  label={t('orders.estimatedDelivery')}
                  value={formatDate(order.estimated_delivery, i18n.language)}
                />
              )}
              {order.rejection_reason && (
                <Row
                  label={t('orders.rejectionReason')}
                  value={order.rejection_reason}
                  emphasis
                />
              )}
            </CardContent>
          </Card>

          {/* Receipt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="size-4" />
                {t('orders.receipt.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receiptUrl ? (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-xl border border-border"
                >
                  <img
                    src={receiptUrl}
                    alt={t('orders.receipt.title')}
                    className="max-h-120 w-full object-contain bg-muted"
                  />
                </a>
              ) : canUpload ? (
                <ReceiptUpload orderId={order.id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('orders.receipt.notUploaded')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('orders.timelineTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline logs={order.logs} />
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <Card className="sticky top-20 self-start">
          <CardHeader>
            <CardTitle className="text-base">
              {t('orders.totalsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label={t('orders.total')}
              value={`${formatPrice(order.total_price, i18n.language)} ${t('common.currency')}`}
            />
            <Row
              label={t('orders.deposit')}
              value={`${formatPrice(order.deposit_amount, i18n.language)} ${t('common.currency')}`}
            />
            {order.deposit_percent && (
              <Row
                label={t('orders.depositPercent')}
                value={`${order.deposit_percent}%`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={
          emphasis
            ? 'text-end font-medium text-destructive'
            : 'text-end font-medium'
        }
      >
        {value}
      </span>
    </div>
  )
}
