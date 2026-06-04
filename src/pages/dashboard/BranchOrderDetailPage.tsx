import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
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
import { OrderActions } from '@/features/branchDashboard/OrderActions'
import { useBranchOrder } from '@/features/branchDashboard/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatDateTime, formatPrice } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

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
                    <span className="line-clamp-1 text-sm font-medium">
                      {it.product_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(it.unit_price, i18n.language)}{' '}
                      {t('common.currency')} × {it.quantity}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(it.total_price, i18n.language)}{' '}
                    <span className="text-xs text-muted-foreground">
                      {t('common.currency')}
                    </span>
                  </span>
                </div>
              ))}
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

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('dashboard.branch.actionsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              <span className="font-semibold text-primary">
                {formatPrice(order.total_price, i18n.language)}{' '}
                <span className="text-xs text-muted-foreground">
                  {t('common.currency')}
                </span>
              </span>
            </Row>
            <Row label={t('orders.deposit')}>
              {formatPrice(order.deposit_amount, i18n.language)}{' '}
              <span className="text-xs text-muted-foreground">
                {t('common.currency')}
              </span>
            </Row>
            {order.deposit_percent && (
              <Row label={t('orders.depositPercent')}>
                {order.deposit_percent}%
              </Row>
            )}
            <div className="border-t border-border pt-3" />
            <Row label={t('dashboard.branch.remaining')}>
              <span className="font-semibold">
                {formatPrice(
                  Math.max(
                    parseFloat(order.total_price) -
                      parseFloat(order.deposit_amount),
                    0,
                  ),
                  i18n.language,
                )}{' '}
                <span className="text-xs text-muted-foreground">
                  {t('common.currency')}
                </span>
              </span>
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
