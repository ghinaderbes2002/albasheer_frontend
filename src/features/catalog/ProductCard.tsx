import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ImageOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductListItem } from '@/types/api'

interface ProductCardProps {
  product: ProductListItem
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const name = pickLang(product.name, product.name_ar, i18n.language)
  const categoryName = pickLang(
    product.category.name,
    product.category.name_ar,
    i18n.language,
  )
  const image = resolveMediaUrl(product.main_image)

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-square bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 start-2">
          {categoryName}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
          {name}
        </h3>
        <div className="mt-auto flex items-baseline gap-1.5 text-primary">
          <span className="text-lg font-bold">
            {formatPrice(product.price, i18n.language)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t('common.currency')}
          </span>
        </div>
      </div>
    </Link>
  )
}
