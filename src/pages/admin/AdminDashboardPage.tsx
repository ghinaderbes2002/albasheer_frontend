import { useTranslation } from 'react-i18next'
import { BarChart3, Package, ShoppingCart, TrendingUp, XCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStats } from '@/features/admin/queries'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminStats()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">{t('admin.stats.title')}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('admin.stats.totalOrders')}
          value={data?.total_orders}
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatCard
          label={t('admin.stats.pendingOrders')}
          value={data?.pending_orders}
          icon={Package}
          loading={isLoading}
          variant="warning"
        />
        <StatCard
          label={t('admin.stats.deliveredOrders')}
          value={data?.delivered_orders}
          icon={TrendingUp}
          loading={isLoading}
          variant="success"
        />
        <StatCard
          label={t('admin.stats.cancelledOrders')}
          value={data?.cancelled_orders}
          icon={XCircle}
          loading={isLoading}
          variant="danger"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={t('admin.stats.todayOrders')}
          value={data?.today_orders}
          icon={BarChart3}
          loading={isLoading}
        />
        <StatCard
          label={t('admin.stats.todayRevenue')}
          value={data?.today_revenue ? `${Number(data.today_revenue).toLocaleString()} ${t('common.currency')}` : undefined}
          icon={TrendingUp}
          loading={isLoading}
          variant="success"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="size-4" />
          <span>{t('admin.stats.totalRevenue')}</span>
        </div>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-48" />
        ) : (
          <p className="mt-2 text-3xl font-bold">
            {data?.total_revenue
              ? `${Number(data.total_revenue).toLocaleString()} ${t('common.currency')}`
              : '—'}
          </p>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string | undefined
  icon: React.ElementType
  loading?: boolean
  variant?: 'default' | 'warning' | 'success' | 'danger'
}

function StatCard({ label, value, icon: Icon, loading, variant = 'default' }: StatCardProps) {
  const colorMap = {
    default: 'text-foreground',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    danger: 'text-destructive',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className={`text-2xl font-bold ${colorMap[variant]}`}>
          {value ?? '—'}
        </p>
      )}
    </div>
  )
}
