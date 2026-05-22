import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CartItemRow } from '@/features/cart/CartItemRow'
import { CartBundleRow } from '@/features/cart/CartBundleRow'
import { CartSummary } from '@/features/cart/CartSummary'
import { useCartStore, useCartSubtotal } from '@/store/cart'

export function CartPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const bundles = useCartStore((s) => s.bundles)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useCartSubtotal()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const depositSuggestion = Math.round(subtotal * 0.1)

  if (items.length === 0 && bundles.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative mb-10">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-150 animate-pulse rounded-full bg-primary/15 blur-3xl"
          />
          <div className="inline-flex size-28 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
            <ShoppingCart className="size-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          {t('cart.empty.title')}
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          {t('cart.empty.subtitle')}
        </p>
        <Button asChild className="mt-10" size="lg">
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
            <CartItemRow key={`${it.product_id}-${it.variant_id ?? 'base'}`} item={it} />
          ))}
          {bundles.map((b) => (
            <CartBundleRow key={b.bundle_id} item={b} />
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
