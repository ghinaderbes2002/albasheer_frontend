import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { BundleCard } from '@/features/bundles/BundleCard'
import { useBundles } from '@/features/bundles/queries'
import { CascadeItem } from '@/components/shared/CascadeItem'
import { GRID_CASCADE, useCascade } from '@/hooks/useCascade'

/** How many bundles the home page shows before sending readers to /bundles. */
const HOME_LIMIT = 3

/**
 * Bundles on the home page, under the "العروض" heading. The full list keeps
 * its own page at /bundles — this is a taster, so it renders nothing at all
 * when there are no bundles rather than leaving an empty heading behind.
 */
export function BundlesSection() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useBundles()
  const nextDelay = useCascade(GRID_CASCADE.queue)
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight

  if (isError || (!isLoading && (!data || data.length === 0))) return null

  const bundles = data?.slice(0, HOME_LIMIT)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-heading text-2xl font-bold md:text-3xl">
            {t('home.offers.title')}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {t('bundles.subtitle')}
          </p>
        </div>
        <Link
          to="/bundles"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t('home.offers.viewAll')}
          <Arrow className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: HOME_LIMIT }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-16/10 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles?.map((b) => (
            <CascadeItem
              key={b.id}
              nextDelay={nextDelay}
              duration={GRID_CASCADE.duration}
              distance={GRID_CASCADE.distance}
            >
              <BundleCard bundle={b} />
            </CascadeItem>
          ))}
        </div>
      )}
    </section>
  )
}
