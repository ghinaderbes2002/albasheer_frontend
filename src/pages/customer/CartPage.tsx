import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CartItemRow } from '@/features/cart/CartItemRow'
import { CartSummary } from '@/features/cart/CartSummary'
import { useCartStore, useCartSubtotal } from '@/store/cart'

export function CartPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useCartSubtotal()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const depositSuggestion = Math.round(subtotal * 0.1)

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative mb-6">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/20 blur-2xl"
          />
          <div className="inline-flex size-24 items-center justify-center rounded-full bg-accent text-primary ring-4 ring-primary/10">
            <ShoppingCart className="size-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('cart.empty.title')}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {t('cart.empty.subtitle')}
        </p>
        <Button asChild className="mt-8 shadow-lg shadow-primary/20" size="lg">
          <Link to="/products">
            {t('cart.empty.cta')}
            <Arrow />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">{t('nav.cart')}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          className="self-start text-destructive hover:bg-destructive/10 sm:self-auto"
        >
          <Trash2 className="size-4" />
          {t('cart.clear')}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <CartItemRow key={it.product_id} item={it} />
          ))}
        </div>

        <CartSummary depositSuggestion={depositSuggestion}>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => navigate('/checkout')}
          >
            {t('cart.checkout')}
            <Arrow />
          </Button>
        </CartSummary>
      </div>
    </div>
  )
}
