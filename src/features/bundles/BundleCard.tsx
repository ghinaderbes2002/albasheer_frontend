import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Boxes, ImageOff, Package } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Bundle } from '@/types/api'

interface BundleCardProps {
  bundle: Bundle
  className?: string
}

export function BundleCard({ bundle, className }: BundleCardProps) {
  const { t, i18n } = useTranslation()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const name = pickLang(bundle.name, bundle.name_ar, i18n.language)
  const description = pickLang(
    bundle.description,
    bundle.description_ar,
    i18n.language,
  )
  // Bundle has its own image; fall back to first product's main image.
  const image =
    resolveMediaUrl(bundle.image) ??
    resolveMediaUrl(bundle.products[0]?.main_image)

  return (
    <Link
      to={`/bundles/${bundle.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}

        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-80 transition-opacity duration-300"
        />

        <Badge
          variant="default"
          className="absolute top-3 start-3 inline-flex items-center gap-1.5 backdrop-blur-sm"
        >
          <Boxes className="size-3.5" />
          {t('bundles.label')}
        </Badge>

        <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          <Package className="size-3" />
          {t('bundles.productsCount', { count: bundle.products.length })}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <div className="mt-auto flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5 text-primary">
            <span className="text-lg font-bold">
              {formatPrice(bundle.price, i18n.language)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {t('common.currency')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {t('catalog.view')}
            <Arrow className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
