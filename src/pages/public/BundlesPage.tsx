import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { BundleCard } from '@/features/bundles/BundleCard'
import { useBundles } from '@/features/bundles/queries'

export function BundlesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBundles()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{t('nav.bundles')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('bundles.subtitle')}
        </p>
      </header>

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
