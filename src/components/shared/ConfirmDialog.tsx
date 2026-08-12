import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  /** Short question, e.g. "حذف طريقة الدفع هذه؟" */
  title: string
  /** What exactly is being acted on — the row's name, usually. */
  description?: string
  confirmLabel?: string
  /** Styles the confirm button as destructive. On by default. */
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * In-app replacement for `window.confirm()`, which renders as a bare browser
 * alert with English buttons and ignores the site's theme and direction.
 *
 * Mount it conditionally: `{target && <ConfirmDialog … />}`.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Escape closes. Focus lands on Cancel, not Confirm — a stray Enter on a
  // delete prompt shouldn't delete anything.
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, pending])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
      onClick={() => {
        if (!pending) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground break-words">
            {description}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant={destructive ? 'destructive' : 'default'}
            className="flex-1"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel ?? t('common.delete')}
          </Button>
          <Button
            ref={cancelRef}
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
