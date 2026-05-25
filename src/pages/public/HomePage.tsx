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
        {/* Blurred background image */}
        <img
          src="/images/al_basheer.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28 relative z-10">
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/20 blur-xl"
            />
            <img
              src="/images/logo_al_basheer-removebg-preview.png"
              alt="البشير"
              className="h-24 w-24 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            />
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md md:text-6xl animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-2xl text-base text-white/80 md:text-lg animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 delay-100">
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
        <div className="mb-10 flex items-end justify-between gap-3">
          <h2 className="section-heading text-2xl font-bold md:text-3xl">
            {t('home.categories.title')}
          </h2>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {categories.map((c) => {
              const icon = resolveMediaUrl(c.icon)
              const name = pickLang(c.name, c.name_ar, i18n.language)
              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.slug}`}
                  className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-card p-5 text-center shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/40"
                >
                  {/* Gold shimmer line at top on hover */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/8 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                    {icon ? (
                      <img src={icon} alt="" className="size-8 object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{name.charAt(0)}</span>
                    )}
                  </div>

                  <span className="text-xs font-semibold leading-snug text-muted-foreground line-clamp-2 transition-colors duration-300 group-hover:text-primary">
                    {name}
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
        <div className="mb-10 flex items-end justify-between gap-3">
          <h2 className="section-heading text-2xl font-bold md:text-3xl">
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
