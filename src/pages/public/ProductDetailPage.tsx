import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductGallery } from '@/features/catalog/ProductGallery'
import { ProductSpecs } from '@/features/catalog/ProductSpecs'
import { AddToCartButton } from '@/features/catalog/AddToCartButton'
import { useProduct } from '@/features/catalog/queries'
import { formatPrice, pickLang } from '@/lib/format'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function ProductDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex flex-col gap-5">
            <Skeleton className="h-5 w-1/3 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <PagePlaceholder
        title="404"
        description={t('errors.notFound')}
        cta={{ label: t('nav.products'), to: '/products' }}
      />
    )
  }

  const Sep = i18n.language.startsWith('ar') ? ChevronLeft : ChevronRight
  const name = pickLang(product.name, product.name_ar, i18n.language)
  const description = pickLang(
    product.description,
    product.description_ar,
    i18n.language,
  )
  const categoryName = pickLang(
    product.category.name,
    product.category.name_ar,
    i18n.language,
  )

  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-border/60 bg-muted/30">
        <nav
          aria-label="breadcrumb"
          className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-foreground">
            {t('nav.home')}
          </Link>
          <Sep className="size-3.5 shrink-0" />
          <Link to="/products" className="transition-colors hover:text-foreground">
            {t('nav.products')}
          </Link>
          <Sep className="size-3.5 shrink-0" />
          <span className="line-clamp-1 font-medium text-foreground">{name}</span>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2">
          <ProductGallery images={product.images} alt={name} />

          <div className="flex flex-col gap-5">
            {/* Category + availability */}
            <div className="flex items-center gap-2">
              <Link to={`/products?category=${product.category.slug}`}>
                <Badge variant="accent">{categoryName}</Badge>
              </Link>
              {!product.is_available && (
                <Badge variant="destructive">{t('catalog.outOfStock')}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              {name}
            </h1>

            {/* Price block */}
            <div className="flex items-baseline gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 gold-glow">
              <span className="text-4xl font-extrabold tabular-nums text-primary">
                {formatPrice(product.price, i18n.language)}
              </span>
              <span className="text-base font-semibold text-primary/60">
                {t('common.currency')}
              </span>
            </div>

            {/* Description */}
            {description && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-1">
              <AddToCartButton product={product} />
            </div>

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-border">
                <div className="border-b border-border bg-muted/40 px-5 py-3">
                  <h2 className="text-sm font-semibold">{t('catalog.specs')}</h2>
                </div>
                <div className="p-4">
                  <ProductSpecs specs={product.specs} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
