import axios from 'axios'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Receipt, Truck } from 'lucide-react'

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
  const { hash } = useLocation()
  const { data: order, isLoading, isError, error } = useOrder(id)

  useEffect(() => {
    if (!hash || isLoading) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, isLoading])
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
  const hasDeposit = order.requires_deposit || parseFloat(order.deposit_amount ?? '0') > 0
  const canUpload = hasDeposit && order.status === 'pending' && !order.receipt_image
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

      {canUpload && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              {t('orders.receipt.uploadRequired')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('orders.receipt.uploadRequiredHint')}
            </p>
          </div>
        </div>
      )}

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

          {/* Receipt — only when deposit is required or receipt already uploaded */}
          {(hasDeposit || receiptUrl) && (
            <Card id="receipt-section">
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
                      loading="lazy"
                      decoding="async"
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
          )}

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
            <RateOrderCard orderId={order.id} existingRating={order.rating} />
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
            {hasDeposit && (
              <Row
                label={t('orders.deposit')}
                value={`${formatPrice(order.deposit_amount, i18n.language)} ${t('common.currency')}`}
              />
            )}
            {order.deposit_percent && hasDeposit && (
              <Row
                label={t('orders.depositPercent')}
                value={`${order.deposit_percent}%`}
              />
            )}
            {order.payment_method ? (
              <div className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-muted-foreground">{t('orders.paymentMethod')}</span>
                <div className="flex items-center gap-2">
                  {order.payment_method.image && (
                    <img
                      src={resolveMediaUrl(order.payment_method.image) ?? order.payment_method.image}
                      alt={order.payment_method.name_ar}
                      loading="lazy"
                      decoding="async"
                      width={28}
                      height={28}
                      className="size-7 rounded object-contain"
                    />
                  )}
                  <span className="text-end font-medium">{order.payment_method.name_ar}</span>
                </div>
              </div>
            ) : (
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
