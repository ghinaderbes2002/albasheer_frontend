import { useTranslation } from 'react-i18next'
import { Boxes, Image, Package, Tag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useContentStats } from '@/features/admin/queries'

export function ContentDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useContentStats()

  const cards = [
    { label: t('admin.nav.categories'), value: data?.total_categories, active: data?.active_categories, icon: Tag, color: 'bg-violet-100 text-violet-700' },
    { label: t('admin.nav.products'), value: data?.total_products, active: data?.active_products, icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: t('admin.nav.bundles'), value: data?.total_bundles, active: data?.active_bundles, icon: Boxes, color: 'bg-amber-100 text-amber-700' },
    { label: t('admin.nav.ads'), value: data?.total_ads, active: data?.active_ads, icon: Image, color: 'bg-emerald-100 text-emerald-700' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h1 className="text-2xl font-bold">{t('admin.stats.title')}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, active, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div className={`flex size-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="size-4" />
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold">{value ?? '—'}</p>
                {active !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('content.activeCount', { count: active })}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
