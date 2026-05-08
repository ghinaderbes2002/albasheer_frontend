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
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
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
        <Link to="/products" className="hover:text-foreground">
          {t('nav.products')}
        </Link>
        <Sep className="size-4" />
        <span className="line-clamp-1 text-foreground">{name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} alt={name} />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Link to={`/products?category=${product.category.slug}`}>
              <Badge variant="accent">{categoryName}</Badge>
            </Link>
            {!product.is_available && (
              <Badge variant="destructive">{t('catalog.outOfStock')}</Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {name}
          </h1>

          <div className="flex items-baseline gap-2 text-primary">
            <span className="text-3xl font-extrabold">
              {formatPrice(product.price, i18n.language)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {t('common.currency')}
            </span>
          </div>

          {description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-2">
            <AddToCartButton product={product} />
          </div>

          {product.specs.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">
                {t('catalog.specs')}
              </h2>
              <ProductSpecs specs={product.specs} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
