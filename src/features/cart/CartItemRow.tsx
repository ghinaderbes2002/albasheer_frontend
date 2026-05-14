import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCartStore, type CartItem } from '@/store/cart'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight

  const name = pickLang(item.name, item.name_ar, i18n.language)
  const image = resolveMediaUrl(item.image)
  const subtotal = parseFloat(item.price) * item.quantity

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
      <Link
        to={`/products/${item.slug}`}
        className="relative aspect-square size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${item.slug}`}
            className="line-clamp-2 text-sm font-semibold hover:text-primary sm:text-base"
          >
            {name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.product_id)}
            aria-label={t('common.delete')}
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground sm:text-sm">
          {formatPrice(item.price, i18n.language)} {t('common.currency')}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div
            dir="ltr"
            className="inline-flex items-center rounded-md border border-border"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-none"
              onClick={() =>
                updateQuantity(item.product_id, item.quantity - 1)
              }
              aria-label="-"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-none"
              onClick={() =>
                updateQuantity(item.product_id, item.quantity + 1)
              }
              aria-label="+"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-baseline gap-1.5 text-primary">
            <span className="text-base font-bold sm:text-lg">
              {formatPrice(subtotal, i18n.language)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('common.currency')}
            </span>
          </div>
        </div>

        <div className="mt-1 flex justify-end border-t border-border pt-2">
          <button
            type="button"
            onClick={() =>
              navigate(`/checkout?product=${item.product_id}`)
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
          >
            {t('cart.buyNow')}
            <Arrow className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
