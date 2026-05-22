import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRateOrder, useOrderRating } from '@/features/orders/queries'
import { extractApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

interface RateOrderCardProps {
  orderId: number | string
}

export function RateOrderCard({ orderId }: RateOrderCardProps) {
  const { t } = useTranslation()
  const { data: existingRating, isLoading } = useOrderRating(orderId)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const rate = useRateOrder(orderId)

  const handleSubmit = async () => {
    if (!rating) return
    try {
      await rate.mutateAsync({ rating, comment: comment || undefined })
      toast.success(t('orders.rate.success'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    )
  }

  // Already rated — show read-only view
  if (existingRating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="size-4" />
            {t('orders.rate.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-7',
                  i < existingRating.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30',
                )}
              />
            ))}
          </div>
          {existingRating.comment && (
            <p className="text-sm text-muted-foreground rounded-xl border border-border bg-muted/30 px-3 py-2">
              {existingRating.comment}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('orders.rate.submitted')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="size-4" />
          {t('orders.rate.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(val)}
                onMouseEnter={() => setHovered(val)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'size-8',
                    val <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/40',
                  )}
                />
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rate-comment">{t('orders.rate.commentLabel')}</Label>
          <Textarea
            id="rate-comment"
            rows={3}
            placeholder={t('orders.rate.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!rating || rate.isPending}
          size="sm"
        >
          {rate.isPending && <Loader2 className="animate-spin" />}
          {t('orders.rate.submit')}
        </Button>
      </CardContent>
    </Card>
  )
}
