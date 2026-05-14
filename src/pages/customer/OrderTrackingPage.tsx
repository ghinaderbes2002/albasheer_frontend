import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/features/orders/StatusBadge'
import { useOrderTracking } from '@/features/orders/queries'
import { formatDateTime } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { cn } from '@/lib/utils'

export function OrderTrackingPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: tracking, isLoading, isError } = useOrderTracking(id)
  const Sep = i18n.language.startsWith('ar') ? ChevronLeft : ChevronRight

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError || !tracking) {
    return (
      <PagePlaceholder
        title="404"
        description={t('errors.notFound')}
        cta={{ label: t('nav.myOrders'), to: '/orders' }}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <nav
        aria-label="breadcrumb"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/orders" className="hover:text-foreground">
          {t('nav.myOrders')}
        </Link>
        <Sep className="size-4" />
        <Link to={`/orders/${id}`} className="hover:text-foreground">
          {t('orders.orderNumber', { id })}
        </Link>
        <Sep className="size-4" />
        <span className="text-foreground">{t('orders.tracking.title')}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('orders.tracking.title')}
        </h1>
        <StatusBadge status={tracking.current_status} className="text-sm" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('orders.tracking.stagesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-0">
            {tracking.stages.map((stage, index) => {
              const isLast = index === tracking.stages.length - 1
              const isCurrent = stage.status === tracking.current_status
              return (
                <li key={stage.status} className="flex gap-4">
                  {/* Line + icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2 z-10',
                      stage.reached
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 bg-background text-muted-foreground/50',
                      isCurrent && 'ring-2 ring-primary/30 ring-offset-2',
                    )}>
                      {stage.reached ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                    </div>
                    {!isLast && (
                      <div className={cn(
                        'w-0.5 flex-1 my-1',
                        stage.reached ? 'bg-primary/40' : 'bg-muted-foreground/20',
                      )} style={{ minHeight: '2rem' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    'pb-6 flex-1',
                    isLast && 'pb-0',
                  )}>
                    <p className={cn(
                      'font-medium text-sm',
                      stage.reached ? 'text-foreground' : 'text-muted-foreground',
                      isCurrent && 'text-primary font-semibold',
                    )}>
                      {stage.label}
                      {isCurrent && (
                        <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Clock className="size-3" />
                          {t('orders.tracking.current')}
                        </span>
                      )}
                    </p>
                    {stage.timestamp && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(stage.timestamp, i18n.language)}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Link
          to={`/orders/${id}`}
          className="text-sm text-primary hover:underline"
        >
          {t('orders.tracking.viewDetails')}
        </Link>
      </div>
    </div>
  )
}
