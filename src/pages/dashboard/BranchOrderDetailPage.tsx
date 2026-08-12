import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  History,
  MapPin,
  Phone,
  Receipt,
  Star,
  User as UserIcon,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { StatusTimeline } from '@/features/orders/StatusTimeline'
import { OrderActions } from '@/features/branchDashboard/OrderActions'
import { FreeDeliveryAlert } from '@/features/branchDashboard/FreeDeliveryAlert'
import { useBranchOrder } from '@/features/branchDashboard/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatDateTime } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { Price } from '@/components/shared/Price'
import { VariantBadge } from '@/features/orders/VariantBadge'

export function BranchOrderDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError } = useBranchOrder(id)
  const Sep = i18n.language.startsWith('ar') ? ChevronLeft : ChevronRight

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <PagePlaceholder
        title="404"
        description={t('errors.notFound')}
        cta={{ label: t('dashboard.branch.title'), to: '/dashboard/branch' }}
      />
    )
  }

  const receiptUrl = resolveMediaUrl(order.receipt_image)

  // Cash-on-delivery orders (no deposit) never involve a receipt, so the
  // card is only noise there. Still show it if one was somehow uploaded.
  const showReceipt = parseFloat(order.deposit_amount) > 0 || !!receiptUrl

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/dashboard/branch" className="hover:text-foreground">
          {t('dashboard.branch.title')}
        </Link>
        <Sep className="size-4" />
        <span className="text-foreground">
          {t('orders.orderNumber', { id: order.id })}
        </span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
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
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="size-4" />
                {t('dashboard.branch.customer')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label={t('auth.profile.firstName')}>
                {order.customer_name || '—'}
              </Row>
              <Row label={t('auth.profile.phone')}>
                <a
                  href={`tel:${order.customer_phone}`}
                  dir="ltr"
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <Phone className="size-3.5" />
                  {order.customer_phone}
                </a>
              </Row>
              <Row label={t('orders.address')}>
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  {order.delivery_address}
                </span>
              </Row>
              {order.delivery_staff_name && (
                <Row label={t('orders.deliveryStaff')}>
                  {order.delivery_staff_name}
                </Row>
              )}
              {order.estimated_delivery && (
                <Row label={t('orders.estimatedDelivery')}>
                  {formatDateTime(order.estimated_delivery, i18n.language)}
                </Row>
              )}
            </CardContent>
          </Card>

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
                  className="flex items-baseline justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      <span className="line-clamp-1">{it.product_name}</span>
                      <VariantBadge name={it.variant_name} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <Price value={it.unit_price} /> × {it.quantity}
                    </span>
                  </div>
                  <Price value={it.total_price} className="font-semibold" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Receipt — deposit orders only */}
          {showReceipt && (
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
                      loading="lazy"
                      decoding="async"
                      className="max-h-120 w-full bg-muted object-contain"
                    />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.branch.noReceipt')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {order.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="size-4" />
                  {t('orders.rate.customerRating')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-6 ${i < order.rating!.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                {order.rating.comment && (
                  <p className="text-sm text-muted-foreground rounded-xl border border-border bg-muted/30 px-3 py-2">
                    {order.rating.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status log — shows who cancelled/rejected the order and why */}
          {order.logs?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="size-4" />
                  {t('orders.timelineTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline logs={order.logs} />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('dashboard.branch.actionsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FreeDeliveryAlert total={order.total_price} />
              <OrderActions order={order} />
            </CardContent>
          </Card>
        </div>

        {/* Summary sidebar */}
        <Card className="sticky top-20 self-start">
          <CardHeader>
            <CardTitle className="text-base">
              {t('orders.totalsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label={t('orders.total')}>
              <Price value={order.total_price} className="font-semibold text-primary" />
            </Row>
            <Row label={t('orders.deposit')}>
              <Price value={order.deposit_amount} />
            </Row>
            {order.deposit_percent && (
              <Row label={t('orders.depositPercent')}>
                {order.deposit_percent}%
              </Row>
            )}
            <div className="border-t border-border pt-3" />
            <Row label={t('dashboard.branch.remaining')}>
              <Price
                value={Math.max(
                  parseFloat(order.total_price) - parseFloat(order.deposit_amount),
                  0,
                )}
                className="font-semibold"
              />
            </Row>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{children}</span>
    </div>
  )
}
