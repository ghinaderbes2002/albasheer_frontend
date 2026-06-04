import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductGallery } from '@/features/catalog/ProductGallery'
import { ProductSpecs } from '@/features/catalog/ProductSpecs'
import { AddToCartButton } from '@/features/catalog/AddToCartButton'
import { useProduct, useProductMeta } from '@/features/catalog/queries'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/shared/Seo'
import type { CartItem } from '@/store/cart'
import { formatPrice, pickLang } from '@/lib/format'
import { resolveMediaUrl } from '@/lib/api'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'
import type { PublicProductVariant } from '@/types/api'

export function ProductDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(slug)
  const { data: meta } = useProductMeta(slug)

  const [selectedVariant, setSelectedVariant] = useState<PublicProductVariant | null>(null)

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

  const variants = product.variants ?? []
  const relatedProducts = product.related_products ?? []

  // When a variant is selected, show its price and availability
  const displayPrice = selectedVariant
    ? formatPrice(selectedVariant.effective_price, lang)
    : formatPrice(product.price, lang)

  const isAvailable = selectedVariant ? selectedVariant.is_available : product.is_available

  function handleBuyNow() {
    if (!product) return
    const effectivePrice = selectedVariant?.effective_price ?? product.price
    const variantMainImage =
      selectedVariant?.images?.find((img) => img.is_main)?.image ??
      selectedVariant?.images?.[0]?.image ?? null
    const productMainImage =
      product.images?.find((img) => img.is_main)?.image ??
      product.images?.[0]?.image ??
      product.main_image ?? null

    const buyNowItem: CartItem = {
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      name_ar: product.name_ar,
      price: effectivePrice,
      image: variantMainImage ?? productMainImage,
      quantity: 1,
      variant_label: selectedVariant ? `${selectedVariant.type}: ${selectedVariant.option_value}` : null,
    }
    navigate('/checkout', { state: { buyNowItem } })
  }

  // The gallery images: use selected variant's images if available, else product images
  const galleryImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images

  // Group variants by type name for rendering
  const variantGroups = variants.reduce<Record<string, PublicProductVariant[]>>((acc, v) => {
    if (!acc[v.type]) acc[v.type] = []
    acc[v.type].push(v)
    return acc
  }, {})

  const seoImage = resolveMediaUrl(
    product.images?.find((i) => i.is_main)?.image ?? product.images?.[0]?.image ?? product.main_image,
  )

  return (
    <div>
      <Seo
        title={meta?.title_ar || product.seo_title || name}
        description={meta?.description_ar || product.meta_description || description || `${name} — ${t('common.currency')} ${product.price}`}
        image={meta?.image || seoImage || undefined}
        url={`/products/${product.slug}`}
        type="product"
        canonical={lang.startsWith('ar') ? meta?.canonical_ar : meta?.canonical_en}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: lang.startsWith('ar') ? product.name_ar : product.name,
          description: description || undefined,
          image: seoImage ?? undefined,
          sku: product.slug,
          brand: { '@type': 'Brand', name: 'البشير' },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'SYP',
            availability: product.is_available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: meta?.canonical_ar ?? `https://albasheercomplex.com/products/${product.slug}`,
          },
        }}
      />
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
          <ProductGallery images={galleryImages} alt={name} lang={lang} />

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

            {/* Variant selectors */}
            {Object.entries(variantGroups).map(([typeName, options]) => (
              <div key={typeName} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{typeName}</p>
                  {selectedVariant && options.some((v) => v.id === selectedVariant.id) && (
                    <button
                      type="button"
                      onClick={() => setSelectedVariant(null)}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      {t('catalog.clearSelection', { defaultValue: 'إلغاء الاختيار' })}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((v) => {
                    const isSelected = selectedVariant?.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.is_available}
                        onClick={() => setSelectedVariant(isSelected ? null : v)}
                        className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all
                          ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : v.is_available
                              ? 'border-border bg-background hover:border-primary hover:text-primary'
                              : 'border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50'
                          }`}
                      >
                        {v.option_value}
                        {v.effective_price !== product.price && (
                          <span className="text-xs opacity-75">
                            {formatPrice(v.effective_price, lang)}
                          </span>
                        )}
                        {isSelected && <span className="text-xs opacity-75">✕</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Description */}
            {description && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            )}

            {/* Add to cart + Buy now */}
            <div className="mt-1 flex flex-wrap gap-3">
              <AddToCartButton product={product} variant={selectedVariant} />
              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={!isAvailable}
                onClick={handleBuyNow}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Zap className="size-4" />
                {t('cart.buyNow')}
              </Button>
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
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold">{t('catalog.relatedProducts')}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {relatedProducts.map((rp) => {
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
                          loading="lazy"
                          decoding="async"
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-muted-foreground/20">
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
