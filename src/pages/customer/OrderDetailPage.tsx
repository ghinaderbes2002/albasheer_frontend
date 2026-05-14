import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, MapPin, Receipt, Truck } from 'lucide-react'

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
import { CancelOrderButton } from '@/features/orders/CancelOrderButton'
import { RateOrderCard } from '@/features/orders/RateOrderCard'
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
  const canUpload = order.requires_deposit && order.status === 'pending' && !order.receipt_image
  const shippingFee = parseFloat(order.shipping_fee ?? '0')

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
        <div className="flex items-center gap-3">
          {order.status === 'pending' && (
            <CancelOrderButton orderId={order.id} />
          )}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <Link
              to={`/orders/${order.id}/tracking`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <MapPin className="size-3.5" />
              {t('orders.tracking.link')}
            </Link>
          )}
          <StatusBadge status={order.status} className="text-sm" />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Bundles in this order */}
          {order.bundle_items && order.bundle_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('orders.bundleItemsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.bundle_items.map((bi) => (
                  <div
                    key={bi.id}
                    className="flex items-baseline justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="line-clamp-1 text-sm font-medium">
                        <span className="me-1.5 inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {t('bundles.label')}
                        </span>
                        {bi.bundle_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(bi.unit_price, i18n.language)}{' '}
                        {t('common.currency')} × {bi.quantity}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(bi.total_price, i18n.language)}{' '}
                      <span className="text-xs text-muted-foreground">
                        {t('common.currency')}
                      </span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Items */}
          {order.items.length > 0 && (
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
          )}

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

          {/* Rating — only after delivery */}
          {order.status === 'delivered' && (
            <RateOrderCard orderId={order.id} />
          )}
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
            {shippingFee > 0 && (
              <Row
                label={t('orders.shippingFee')}
                value={`${formatPrice(order.shipping_fee, i18n.language)} ${t('common.currency')}`}
              />
            )}
            {order.requires_deposit && (
              <Row
                label={t('orders.deposit')}
                value={`${formatPrice(order.deposit_amount, i18n.language)} ${t('common.currency')}`}
              />
            )}
            {order.deposit_percent && order.requires_deposit && (
              <Row
                label={t('orders.depositPercent')}
                value={`${order.deposit_percent}%`}
              />
            )}
            {!order.requires_deposit && (
              <Row
                label={t('orders.paymentMethod')}
                value={t('checkout.deposit.codTitle')}
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
