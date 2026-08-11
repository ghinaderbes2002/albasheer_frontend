import { cn } from '@/lib/utils'

interface VariantBadgeProps {
  /** `variant_name` off an order item — null on orders placed without a variant. */
  name?: string | null
  className?: string
}

/**
 * The chosen product variant on an order line, styled like the label the
 * cart already shows (`CartItemRow`). Renders nothing when the line has no
 * variant — including every order placed before the checkout started
 * sending `variant_id`.
 */
export function VariantBadge({ name, className }: VariantBadgeProps) {
  if (!name) return null
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground',
        className,
      )}
    >
      {name}
    </span>
  )
}
