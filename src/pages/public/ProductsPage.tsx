import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ProductGrid } from '@/features/catalog/ProductGrid'
import { CategoryFilter } from '@/features/catalog/CategoryFilter'
import { SearchBar } from '@/features/catalog/SearchBar'
import { Pagination } from '@/features/catalog/Pagination'
import { useProducts } from '@/features/catalog/queries'
import { PRODUCTS_PAGE_SIZE } from '@/api/products'

const PAGE_SIZE = PRODUCTS_PAGE_SIZE

export function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') ?? null
  const search = searchParams.get('search') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10) || 1

  const { data, isLoading, isError } = useProducts({
    category: category ?? undefined,
    search: search || undefined,
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{t('nav.products')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('catalog.totalCount', { count: data?.count ?? 0 })}
        </p>
      </header>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={search}
          onChange={(v) => updateParam('search', v)}
          placeholder={t('catalog.searchPlaceholder')}
          className="lg:w-96"
        />
      </div>

      <div className="mb-6">
        <CategoryFilter
          active={category}
          onChange={(slug) => updateParam('category', slug)}
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
  )
}
