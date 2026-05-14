import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ImageOff } from 'lucide-react'

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
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
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
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Category chip */}
        <Badge
          variant="secondary"
          className="absolute top-2 start-2 backdrop-blur-sm"
        >
          {categoryName}
        </Badge>

        {/* "View" pill — appears on hover */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
            {t('catalog.view')}
            <Arrow className="size-3.5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
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
