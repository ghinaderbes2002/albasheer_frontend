import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useCancelOrder } from '@/features/orders/queries'
import { extractApiError } from '@/lib/api'
import { useState } from 'react'

interface CancelOrderButtonProps {
  orderId: number | string
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const cancel = useCancelOrder(orderId)
  const yesRef = useRef<HTMLButtonElement>(null)

  // Focus the Yes button when dialog opens, close on Escape
  useEffect(() => {
    if (!open) return
    yesRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const handleConfirm = async () => {
    try {
      await cancel.mutateAsync()
      toast.success(t('orders.cancel.success'))
      setOpen(false)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="border-destructive/40 text-destructive hover:bg-destructive/5"
        onClick={() => setOpen(true)}
      >
        <XCircle className="size-4" />
        {t('orders.cancel.button')}
      </Button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Panel */}
            <div className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-7 text-destructive" />
                </span>
              </div>

              {/* Text */}
              <h2
                id="cancel-dialog-title"
                className="mb-2 text-center text-lg font-bold"
              >
                {t('orders.cancel.dialogTitle')}
              </h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {t('orders.cancel.confirm')}
              </p>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  disabled={cancel.isPending}
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                >
                  {t('orders.cancel.no')}
                </Button>
                <Button
                  ref={yesRef}
                  variant="destructive"
                  disabled={cancel.isPending}
                  onClick={handleConfirm}
                  className="w-full sm:w-auto"
                >
                  {cancel.isPending && <Loader2 className="size-4 animate-spin" />}
                  {t('orders.cancel.yes')}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
