import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductGallery } from '@/features/catalog/ProductGallery'
import { ProductSpecs } from '@/features/catalog/ProductSpecs'
import { AddToCartButton } from '@/features/catalog/AddToCartButton'
import { useProduct, useProductVariants, useProductRelated } from '@/features/catalog/queries'
import { formatPrice, pickLang } from '@/lib/format'
import { resolveMediaUrl } from '@/lib/api'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import type { ProductVariant } from '@/types/api'

export function ProductDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)
  const { data: variants } = useProductVariants(slug)
  const { data: related } = useProductRelated(slug)

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const lang = i18n.language
  const isRtl = lang.startsWith('ar')
  const Sep = isRtl ? ChevronLeft : ChevronRight

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

  const name = pickLang(product.name, product.name_ar, lang)
  const description = pickLang(product.description, product.description_ar, lang)
  const categoryName = pickLang(product.category.name, product.category.name_ar, lang)

  const displayPrice = selectedVariant
    ? formatPrice(selectedVariant.price, lang)
    : formatPrice(product.price, lang)

  const isAvailable = selectedVariant
    ? selectedVariant.is_available
    : product.is_available

  // Group variants by type name
  const variantsByType = (variants ?? []).reduce<
    Record<string, { typeName: string; typeName_ar: string; options: ProductVariant[] }>
  >((acc, v) => {
    const typeId = String(v.option.variant_type)
    if (!acc[typeId]) {
      acc[typeId] = {
        typeName: '',
        typeName_ar: '',
        options: [],
      }
    }
    acc[typeId].options.push(v)
    return acc
  }, {})

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-muted/30">
        <nav
          aria-label="breadcrumb"
          className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-foreground">{t('nav.home')}</Link>
          <Sep className="size-3.5 shrink-0" />
          <Link to="/products" className="transition-colors hover:text-foreground">{t('nav.products')}</Link>
          <Sep className="size-3.5 shrink-0" />
          <span className="line-clamp-1 font-medium text-foreground">{name}</span>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2">
          <ProductGallery images={product.images} alt={name} />

          <div className="flex flex-col gap-5">
            {/* Category + availability */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/products?category=${product.category.slug}`}>
                <Badge variant="accent">{categoryName}</Badge>
              </Link>
              {!isAvailable && (
                <Badge variant="destructive">{t('catalog.outOfStock')}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 gold-glow">
              <span className="text-4xl font-extrabold tabular-nums text-primary">
                {displayPrice}
              </span>
              <span className="text-base font-semibold text-primary/60">{t('common.currency')}</span>
            </div>

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div className="space-y-3">
                {Object.values(variantsByType).map((group, gi) => (
                  <div key={gi} className="space-y-2">
                    {group.options.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((v) => {
                          const label = isRtl ? v.option.value_ar : v.option.value
                          const isSelected = selectedVariant?.id === v.id
                          return (
                            <button
                              key={v.id}
                              type="button"
                              disabled={!v.is_available}
                              onClick={() => setSelectedVariant(isSelected ? null : v)}
                              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all
                                ${isSelected
                                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                  : v.is_available
                                    ? 'border-border bg-background hover:border-primary hover:text-primary'
                                    : 'border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50'
                                }`}
                            >
                              {label}
                              {v.price !== product.price && (
                                <span className="ms-1.5 text-xs opacity-75">
                                  {formatPrice(v.price, lang)}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

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

        {/* Related Products */}
        {related && related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold">{t('catalog.relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {related.map((rp) => {
                const rpName = pickLang(rp.name, rp.name_ar, lang)
                return (
                  <Link
                    key={rp.id}
                    to={`/products/${rp.slug}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {rp.main_image ? (
                        <img
                          src={resolveMediaUrl(rp.main_image) ?? rp.main_image}
                          alt={rpName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/30 text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{rpName}</p>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {formatPrice(rp.price, lang)}{' '}
                        <span className="text-xs font-normal text-muted-foreground">{t('common.currency')}</span>
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
