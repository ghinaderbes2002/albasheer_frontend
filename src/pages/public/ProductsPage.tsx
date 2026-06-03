import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ProductGrid } from '@/features/catalog/ProductGrid'
import { CategoryFilter } from '@/features/catalog/CategoryFilter'
import { BrandFilter } from '@/features/catalog/BrandFilter'
import { SearchBar } from '@/features/catalog/SearchBar'
import { Pagination } from '@/features/catalog/Pagination'
import { useProducts } from '@/features/catalog/queries'
import { PRODUCTS_PAGE_SIZE, type ProductOrdering } from '@/api/products'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'

const PAGE_SIZE = PRODUCTS_PAGE_SIZE

export function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') ?? null
  const brand = searchParams.get('brand') ?? null
  const search = searchParams.get('search') ?? ''
  const ordering = (searchParams.get('ordering') ?? '') as ProductOrdering
  const page = parseInt(searchParams.get('page') ?? '1', 10) || 1

  const { data, isLoading, isError } = useProducts({
    category: category ?? undefined,
    brand: brand ?? undefined,
    search: search || undefined,
    ordering: ordering || undefined,
    page,
  })

  // Reset to page 1 if filters change while we're on a deeper page.
  useEffect(() => {
    if (page > 1 && data && data.results.length === 0 && data.count > 0) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', '1')
        return next
      })
    }
  }, [page, data, setSearchParams])

  const updateParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value && value.length > 0) next.set(key, value)
      else next.delete(key)
      // Always reset pagination when filters change.
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  return (
    <div>
      <Seo title={t('nav.products')} description={t('catalog.heroSubtitle')} url="/products" />
      <PageHero
        title={t('nav.products')}
        subtitle={t('catalog.heroSubtitle')}
        image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80&auto=format&fit=crop"
      />
    <div className="mx-auto w-full max-w-7xl px-4 py-8">

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={(v) => updateParam('search', v)}
          placeholder={t('catalog.searchPlaceholder')}
          className="sm:w-96"
        />
        <select
          value={ordering}
          onChange={(e) => updateParam('ordering', e.target.value)}
          className="h-10 rounded-full border border-border bg-card px-4 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">{t('catalog.sort.default')}</option>
          <option value="price_asc">{t('catalog.sort.priceAsc')}</option>
          <option value="price_desc">{t('catalog.sort.priceDesc')}</option>
        </select>
      </div>

      <div className="mb-3">
        <CategoryFilter
          active={category}
          onChange={(slug) => updateParam('category', slug)}
        />
      </div>

      <div className="mb-6">
        <BrandFilter
          active={brand}
          onChange={(slug) => updateParam('brand', slug)}
        />
      </div>

      <ProductGrid
        products={data?.results}
        isLoading={isLoading}
        isError={isError}
      />

      {data && (
        <div className="mt-8">
          <Pagination
            page={page}
            totalCount={data.count}
            pageSize={PAGE_SIZE}
            hasNext={!!data.next}
            hasPrevious={!!data.previous}
            onChange={(p) => updateParam('page', String(p))}
          />
        </div>
      )}
    </div>
    </div>
  )
}
