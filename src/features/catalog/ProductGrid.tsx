import { useTranslation } from 'react-i18next'
import { PackageX } from 'lucide-react'

import { ProductCard } from '@/features/catalog/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { CascadeItem } from '@/components/shared/CascadeItem'
import { useCascade } from '@/hooks/useCascade'
import { PRODUCT_CASCADE } from '@/features/catalog/cascade'
import type { ProductListItem } from '@/types/api'

interface ProductGridProps {
  products: ProductListItem[] | undefined
  isLoading?: boolean
  isError?: boolean
  /** Number of skeleton placeholders shown while loading. */
  skeletonCount?: number
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  skeletonCount = 8,
}: ProductGridProps) {
  const { t } = useTranslation()
  const nextDelay = useCascade(PRODUCT_CASCADE.queue)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
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
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <PackageX className="size-10" />
        <p>{t('errors.generic')}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
        <PackageX className="size-10" />
        <p>{t('catalog.empty')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <CascadeItem
          key={p.id}
          nextDelay={nextDelay}
          duration={PRODUCT_CASCADE.duration}
          distance={PRODUCT_CASCADE.distance}
        >
          <ProductCard product={p} />
        </CascadeItem>
      ))}
    </div>
  )
}
