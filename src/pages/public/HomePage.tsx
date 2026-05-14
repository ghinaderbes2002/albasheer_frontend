import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  ShieldCheck,
  Truck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/catalog/ProductCard'
import { useCategories, useProducts } from '@/features/catalog/queries'
import { AdsCarousel } from '@/features/ads/AdsCarousel'
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
      {/* Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_15%,rgba(212,175,55,0.10),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.06),transparent_55%)]" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/15 blur-xl"
            />
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary text-3xl font-extrabold ring-4 ring-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              B
            </div>
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-500">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
            {t('home.hero.subtitle')}
          </p>

          <Button asChild size="lg" className="mt-2 shadow-lg shadow-primary/20">
            <Link to="/products">
              {t('home.hero.cta')}
              <Arrow />
            </Link>
          </Button>

          {/* Trust pills */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: ShieldCheck, label: t('home.trust.warranty') },
              { icon: Truck, label: t('home.trust.delivery') },
              { icon: Award, label: t('home.trust.quality') },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                <Icon className="size-3.5 text-primary" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ads ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10">
        <AdsCarousel />
      </section>

      {/* Categories ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14">
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
                    'group relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-all',
                    'hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10',
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-300 group-hover:from-primary/5 group-hover:to-primary/10"
                  />
                  <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        className="size-8 object-contain"
                      />
                    ) : (
                      <span className="text-xl font-bold">
                        {pickLang(c.name, c.name_ar, i18n.language).charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-center text-sm font-semibold line-clamp-2">
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

      {/* Featured ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20">
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
            {featured.map((p, idx) => (
              <div
                key={p.id}
                style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('catalog.empty')}</p>
        )}
      </section>
    </>
  )
}
