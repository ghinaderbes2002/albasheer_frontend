import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCartStore, useCartSubtotal } from '@/store/cart'
import { Price } from '@/components/shared/Price'

interface CartSummaryProps {
  /**
   * Bottom action area — typically the "Checkout" button.
   */
  children?: React.ReactNode
  /** Optional deposit suggestion (10% etc.). Shown only when > 0. */
  depositSuggestion?: number
}

export function CartSummary({ children, depositSuggestion }: CartSummaryProps) {
  const { t } = useTranslation()
  const subtotal = useCartSubtotal()
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  )

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>{t('cart.summary.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {t('cart.summary.items')}
          </span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {t('cart.summary.subtotal')}
          </span>
          <Price value={subtotal} className="font-medium" />
        </div>

        {depositSuggestion !== undefined && depositSuggestion > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t('cart.summary.depositSuggestion')}
            </span>
            <Price value={depositSuggestion} className="font-medium text-primary" />
          </div>
        )}

        <div className="my-2 h-px bg-border" />

        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{t('cart.summary.total')}</span>
          <Price value={subtotal} className="text-xl font-bold text-primary" />
        </div>

        {children && <div className="pt-3">{children}</div>}
      </CardContent>
    </Card>
  )
}
