import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { BundleCard } from '@/features/bundles/BundleCard'
import { useBundles } from '@/features/bundles/queries'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'

export function BundlesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBundles()

  return (
    <div>
      <Seo title={t('nav.bundles')} description={t('bundles.subtitle')} url="/bundles" />
      <PageHero
        title={t('nav.bundles')}
        subtitle={t('bundles.subtitle')}
        image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop"
      />
    <div className="mx-auto w-full max-w-7xl px-4 py-8">

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState message={t('errors.generic')} />
      ) : !data || data.length === 0 ? (
        <EmptyState message={t('bundles.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Boxes className="size-10" />
      <p>{message}</p>
    </div>
  )
}
