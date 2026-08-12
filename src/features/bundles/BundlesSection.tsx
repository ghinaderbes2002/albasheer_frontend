import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ImageOff, Layers, Sparkles } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Price } from '@/components/shared/Price'
import { useBundles } from '@/features/bundles/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import type { Bundle } from '@/types/api'

/** How many bundles the home page shows before sending readers to /bundles. */
const HOME_LIMIT = 3
/** Product thumbnails shown on a card before collapsing into "+N". */
const MAX_THUMBS = 4

/**
 * Bundles on the home page, under the "العروض" heading. The full list keeps
 * its own page at /bundles — this is a taster, so it renders nothing at all
 * when there are no bundles rather than leaving an empty heading behind.
 *
 * The cards are richer than the ones on /bundles: they carry the saving
 * against buying the products separately, plus thumbnails of what's inside,
 * because on the home page a bundle has to earn a click against everything
 * else on the page.
 */
export function BundlesSection() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useBundles()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight

  if (isError || (!isLoading && (!data || data.length === 0))) return null

  const bundles = data?.slice(0, HOME_LIMIT)

  return (
    <section className="relative w-full overflow-hidden py-16">
      {/* Warm band that lifts the offers off the plain page background. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-brand-100/60 via-background to-background dark:from-ink-900"
      />

      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="size-3.5" />
            {t('home.offers.badge')}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
            {t('home.offers.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            {t('bundles.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: HOME_LIMIT }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border/60">
                <Skeleton className="aspect-4/3 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: a swipeable strip — 82vw cards hint at the next one. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 sm:hidden">
              {bundles?.map((b) => (
                <div key={b.id} className="w-[82vw] shrink-0 snap-start">
                  <OfferCard bundle={b} Arrow={Arrow} />
                </div>
              ))}
            </div>

            {/* Desktop / tablet */}
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {bundles?.map((b) => (
                <OfferCard key={b.id} bundle={b} Arrow={Arrow} />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/bundles"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            {t('home.offers.viewAll')}
            <Arrow className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function OfferCard({
  bundle,
  Arrow,
}: {
  bundle: Bundle
  Arrow: React.ComponentType<{ className?: string }>
}) {
  const { t, i18n } = useTranslation()
  const name = pickLang(bundle.name, bundle.name_ar, i18n.language)
  const image =
    resolveMediaUrl(bundle.image) ??
    resolveMediaUrl(bundle.products[0]?.main_image)

  // What the same products would cost bought one by one — the saving is the
  // whole point of a bundle, so it leads the card.
  const productsTotal = bundle.products.reduce(
    (sum, p) => sum + parseFloat(p.price),
    0,
  )
  const savings = productsTotal - parseFloat(bundle.price)
  const showSavings = savings > 0

  const thumbs = bundle.products.slice(0, MAX_THUMBS)
  const extraCount = bundle.products.length - thumbs.length

  return (
    <Link
      to={`/bundles/${bundle.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-warm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 33vw"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}

        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent"
        />

        <span className="absolute top-3 inset-s-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
          <Layers className="size-3" />
          {t('bundles.productsCount', { count: bundle.products.length })}
        </span>

        {showSavings && (
          <span className="absolute top-3 inset-e-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {t('home.offers.save', {
              amount: formatPrice(savings, i18n.language),
              currency: t('common.currency'),
            })}
          </span>
        )}

        <h3 className="absolute inset-x-4 bottom-3 line-clamp-2 text-lg font-extrabold leading-snug text-white drop-shadow-sm">
          {name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* What's inside — a glance at the contents without leaving the page. */}
        {thumbs.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {thumbs.map((p, i) => {
                const thumb = resolveMediaUrl(p.main_image)
                return (
                  <span
                    key={p.id}
                    className="size-9 overflow-hidden rounded-full border-2 border-card bg-muted"
                    style={{ marginInlineStart: i === 0 ? 0 : '-0.5rem' }}
                  >
                    {thumb && (
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                )
              })}
            </div>
            {extraCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {showSavings && (
              <span
                dir="ltr"
                className="text-xs text-muted-foreground line-through"
              >
                {formatPrice(productsTotal, i18n.language)}
              </span>
            )}
            <Price
              value={bundle.price}
              className="text-xl font-extrabold text-primary"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            {t('catalog.view')}
            <Arrow className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
