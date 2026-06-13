import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface PriceProps {
  value: string | number
  className?: string
  symbolClassName?: string
}

export function Price({ value, className, symbolClassName }: PriceProps) {
  const { t, i18n } = useTranslation()
  return (
    <span dir="ltr" className={cn('inline-flex items-baseline gap-0.5', className)}>
      <span className={cn('text-[0.7em]', symbolClassName)}>{t('common.currency')}</span>
      {formatPrice(value, i18n.language)}
    </span>
  )
}
