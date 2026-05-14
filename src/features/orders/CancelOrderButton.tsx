import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useCancelOrder } from '@/features/orders/queries'
import { extractApiError } from '@/lib/api'

interface CancelOrderButtonProps {
  orderId: number | string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const cancel = useCancelOrder(orderId)

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync()
      toast.success(t('orders.cancel.success'))
      setConfirming(false)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('orders.cancel.confirm')}
        </span>
        <Button
          size="sm"
          variant="destructive"
          disabled={cancel.isPending}
          onClick={handleCancel}
        >
          {cancel.isPending && <Loader2 className="animate-spin" />}
          {t('orders.cancel.yes')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={cancel.isPending}
          onClick={() => setConfirming(false)}
        >
          {t('common.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-destructive/40 text-destructive hover:bg-destructive/5"
      onClick={() => setConfirming(true)}
    >
      <XCircle className="size-4" />
      {t('orders.cancel.button')}
    </Button>
  )
}
