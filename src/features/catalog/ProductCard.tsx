import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Heart, ImageOff, ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useFavorites, useToggleFavorite } from '@/features/catalog/queries'
import { useAuthStore } from '@/store/auth'
import type { ProductListItem } from '@/types/api'

interface ProductCardProps {
  product: ProductListItem
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const isLoggedIn = !!useAuthStore((s) => s.accessToken)
  const { data: favorites } = useFavorites()
  const toggleFav = useToggleFavorite()
  const isFav = favorites?.some((f) => f.id === product.id) ?? false
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const name = pickLang(product.name, product.name_ar, i18n.language)
  const categoryName = pickLang(
    product.category.name,
    product.category.name_ar,
    i18n.language,
  )
  const image = resolveMediaUrl(product.main_image)

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-warm transition-[transform,box-shadow] duration-300',
        'hover:-translate-y-1.5 hover:shadow-warm-lg',
        className,
      )}
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-muted/60">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
              <ImageOff className="size-12" />
            </div>
          )}

          {/* Category chip top-left */}
          <Badge
            variant="secondary"
            className="absolute top-3 inset-s-3 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm bg-background/80 text-foreground border-0"
          >
            {categoryName}
          </Badge>

          {/* Hover overlay gradient */}
          <span
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Add to cart — slides up on hover */}
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-center gap-1.5 rounded-full border border-background/60 bg-background/90 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
              <ShoppingCart className="size-3.5" />
              {t('catalog.view')}
              <Arrow className="size-3" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
            {name}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="inline-flex items-baseline gap-0.5">
              <span className="text-base font-extrabold tabular-nums text-foreground">
                {formatPrice(product.price, i18n.language)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {' '}{t('common.currency')}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              {t('catalog.inStock', { defaultValue: 'متوفر' })}
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist — خارج الـ Link تماماً */}
      {isLoggedIn && (
        <button
          type="button"
          onClick={() => toggleFav.mutate(product.id)}
          disabled={toggleFav.isPending}
          className={cn(
            'absolute top-3 inset-e-3 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur-sm shadow-sm transition-[transform,background-color,color] duration-200 hover:scale-110',
            isFav
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-background/80 text-muted-foreground hover:bg-background hover:text-red-500',
          )}
          aria-label={isFav
            ? t('catalog.removeFromFavorites', { defaultValue: 'إزالة من المفضلة' })
            : t('catalog.addToFavorites', { defaultValue: 'إضافة للمفضلة' })}
        >
          <Heart className={cn('size-4', isFav && 'fill-current')} />
        </button>
      )}
    </div>
  )
}
