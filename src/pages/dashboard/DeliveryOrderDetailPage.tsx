import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  Receipt,
  User as UserIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { DeliveryActions } from '@/features/deliveryDashboard/DeliveryActions'
import { useDeliveryOrder } from '@/features/deliveryDashboard/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatDateTime, formatPrice } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

function buildMapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`
}

export function DeliveryOrderDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError } = useDeliveryOrder(id)
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
        cta={{
          label: t('dashboard.delivery.title'),
          to: '/dashboard/delivery',
        }}
      />
    )
  }

  const receiptUrl = resolveMediaUrl(order.receipt_image)
  const remaining = Math.max(
    parseFloat(order.total_price) - parseFloat(order.deposit_amount),
    0,
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/dashboard/delivery" className="hover:text-foreground">
          {t('dashboard.delivery.title')}
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
          {/* Customer + quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="size-4" />
                {t('dashboard.branch.customer')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-lg font-semibold">
                  {order.customer_name ||
                    t('dashboard.branch.unnamedCustomer')}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="flex-1">
                  <a href={`tel:${order.customer_phone}`} dir="ltr">
                    <Phone />
                    <span>{order.customer_phone}</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <a
                    href={buildMapUrl(order.delivery_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin />
                    {t('dashboard.delivery.openMap')}
                    <ExternalLink className="size-3.5 opacity-60" />
                  </a>
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{order.delivery_address}</span>
              </div>
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
                      ×{it.quantity}
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

          {/* Receipt (read-only) */}
          {receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="size-4" />
                  {t('orders.receipt.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-xl border border-border"
                >
                  <img
                    src={receiptUrl}
                    alt={t('orders.receipt.title')}
                    className="max-h-120 w-full bg-muted object-contain"
                  />
                </a>
              </CardContent>
            </Card>
          )}

          {/* Action area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('dashboard.delivery.actionsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryActions order={order} />
            </CardContent>
          </Card>
        </div>

        {/* Money sidebar — emphasis on what to collect */}
        <Card className="sticky top-20 self-start">
          <CardHeader>
            <CardTitle className="text-base">
              {t('orders.totalsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label={t('orders.total')}>
              {formatPrice(order.total_price, i18n.language)}{' '}
              <span className="text-xs text-muted-foreground">
                {t('common.currency')}
              </span>
            </Row>
            <Row label={t('orders.deposit')}>
              −{formatPrice(order.deposit_amount, i18n.language)}{' '}
              <span className="text-xs text-muted-foreground">
                {t('common.currency')}
              </span>
            </Row>

            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
              <div className="text-xs uppercase tracking-wider text-primary">
                {t('dashboard.delivery.amountToCollect')}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-primary">
                  {formatPrice(remaining, i18n.language)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('common.currency')}
                </span>
              </div>
            </div>
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
