import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Package,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/catalog/ProductCard'
import { AddBundleToCartButton } from '@/features/bundles/AddBundleToCartButton'
import { useBundle } from '@/features/bundles/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import { Price } from '@/components/shared/Price'

export function BundleDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: bundle, isLoading, isError } = useBundle(id)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-16/10 w-full rounded-xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="mt-auto h-12 w-48" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !bundle) {
    return (
      <PagePlaceholder
        title="404"
        description={t('errors.notFound')}
        cta={{ label: t('nav.bundles'), to: '/bundles' }}
      />
    )
  }

  const Sep = i18n.language.startsWith('ar') ? ChevronLeft : ChevronRight
  const name = pickLang(bundle.name, bundle.name_ar, i18n.language)
  const description = pickLang(
    bundle.description,
    bundle.description_ar,
    i18n.language,
  )
  const image =
    resolveMediaUrl(bundle.image) ??
    resolveMediaUrl(bundle.products[0]?.main_image)

  // Sum of standalone products' prices, for a "save" hint.
  const productsTotal = bundle.products.reduce(
    (sum, p) => sum + parseFloat(p.price),
    0,
  )
  const bundlePrice = parseFloat(bundle.price)
  const savings = productsTotal - bundlePrice
  const showSavings = savings > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link to="/" className="hover:text-foreground">
          {t('nav.home')}
        </Link>
        <Sep className="size-4" />
        <Link to="/bundles" className="hover:text-foreground">
          {t('nav.bundles')}
        </Link>
        <Sep className="size-4" />
        <span className="line-clamp-1 text-foreground">{name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border bg-muted">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={800}
              height={500}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageOff className="size-12" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{t('bundles.label')}</Badge>
            <Badge variant="outline" className="inline-flex items-center gap-1.5">
              <Package className="size-3" />
              {t('bundles.productsCount', {
                count: bundle.products.length,
              })}
            </Badge>
            {!bundle.is_available && (
              <Badge variant="destructive">{t('catalog.outOfStock')}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {name}
          </h1>

          <Price value={bundle.price} className="text-3xl font-extrabold text-primary" />

          {showSavings && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              {t('bundles.savings', {
                amount: formatPrice(savings, i18n.language),
                currency: t('common.currency'),
              })}
            </div>
          )}

          {description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-2">
            <AddBundleToCartButton bundle={bundle} />
          </div>
        </div>
      </div>

      {/* Bundle contents */}
      {bundle.products.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 flex items-baseline gap-2 text-xl font-bold md:text-2xl">
            {t('bundles.includes')}
            <span className="text-sm font-normal text-muted-foreground">
              ({bundle.products.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bundle.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
