import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/catalog/ProductCard'
import { useCategories, useProducts } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight

  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: products, isLoading: prodLoading } = useProducts({ page: 1 })
  const featured = products?.results?.slice(0, 8)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary via-secondary to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.12),transparent_50%)]" />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary text-3xl font-extrabold ring-4 ring-primary/30">
            B
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-secondary-foreground md:text-6xl">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-2xl text-base text-secondary-foreground/80 md:text-lg">
            {t('home.hero.subtitle')}
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link to="/products">
              {t('home.hero.cta')}
              <Arrow />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold md:text-3xl">
            {t('home.categories.title')}
          </h2>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => {
              const icon = resolveMediaUrl(c.icon)
              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className={cn(
                    'group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all',
                    'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                  )}
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon ? (
                      <img src={icon} alt="" className="size-8 object-contain" />
                    ) : (
                      <span className="text-xl font-bold">
                        {pickLang(c.name, c.name_ar, i18n.language).charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center line-clamp-2">
                    {pickLang(c.name, c.name_ar, i18n.language)}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('home.categories.empty')}</p>
        )}
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold md:text-3xl">
            {t('home.featured.title')}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">
              {t('home.featured.viewAll')}
              <Arrow />
            </Link>
          </Button>
        </div>

        {prodLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border"
              >
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('catalog.empty')}</p>
        )}
      </section>
    </>
  )
}
