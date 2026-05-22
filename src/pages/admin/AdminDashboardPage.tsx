import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStats } from '@/features/admin/queries'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminStats()

  const currency = t('common.currency')
  const fmt = (v?: string | number) =>
    v != null ? Number(v).toLocaleString('en-US') : undefined

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t('admin.stats.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('common.appName')}</p>
      </div>

      {/* Total revenue — hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
        <div className="absolute -inset-e-8 -top-8 size-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 inset-e-16 size-28 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/70">
            <TrendingUp className="size-4" />
            {t('admin.stats.totalRevenue')}
          </div>
          {isLoading ? (
            <Skeleton className="mt-3 h-10 w-52 bg-white/20" />
          ) : (
            <p className="mt-3 text-4xl font-extrabold" dir="ltr">
              {fmt(data?.total_revenue) ?? '—'}
              <span className="ms-2 text-lg font-medium text-primary-foreground/70">{currency}</span>
            </p>
          )}
          <div className="mt-4 flex gap-6 text-sm text-primary-foreground/60">
            <span>
              {t('admin.stats.todayOrders')}:{' '}
              <span className="font-semibold text-primary-foreground">
                {isLoading ? '…' : (data?.orders_today ?? '—')}
              </span>
            </span>
            <span>
              {t('admin.stats.totalCustomers')}:{' '}
              <span className="font-semibold text-primary-foreground">
                {isLoading ? '…' : (data?.total_customers ?? '—')}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Order stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('admin.stats.totalOrders')}
          value={data?.total_orders}
          icon={ShoppingCart}
          loading={isLoading}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          label={t('admin.stats.pendingOrders')}
          value={data?.orders_by_status?.pending}
          icon={Package}
          loading={isLoading}
          iconBg="bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400"
          valueColor="text-amber-500 dark:text-amber-400"
        />
        <StatCard
          label={t('admin.stats.confirmedOrders')}
          value={data?.orders_by_status?.confirmed}
          icon={CheckCircle2}
          loading={isLoading}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          valueColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label={t('admin.stats.shippingOrders')}
          value={data?.orders_by_status?.shipping}
          icon={Truck}
          loading={isLoading}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
          valueColor="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          label={t('admin.stats.deliveredOrders')}
          value={data?.orders_by_status?.delivered}
          icon={TrendingUp}
          loading={isLoading}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label={t('admin.stats.totalProducts')}
          value={data?.total_products}
          icon={Package}
          loading={isLoading}
          iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
          valueColor="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label={t('admin.stats.totalCustomers')}
          value={data?.total_customers}
          icon={Users}
          loading={isLoading}
          iconBg="bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400"
          valueColor="text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* Cancelled — full width accent */}
      <div className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
            <XCircle className="size-5 text-destructive" />
          </div>
          <span className="font-medium text-destructive">{t('admin.stats.cancelledOrders')}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <span className="text-2xl font-bold text-destructive">{data?.orders_by_status?.cancelled ?? '—'}</span>
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
  iconBg?: string
  valueColor?: string
}

function StatCard({ label, value, icon: Icon, loading, iconBg = 'bg-muted text-muted-foreground', valueColor = 'text-foreground' }: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`flex size-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="size-4" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className={`text-3xl font-extrabold ${valueColor}`}>{value ?? '—'}</p>
      )}
    </div>
  )
}
