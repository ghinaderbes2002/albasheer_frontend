import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { useUploadReceipt } from '@/features/orders/queries'
import { extractApiError } from '@/lib/api'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface ReceiptUploadProps {
  orderId: number | string
}

export function ReceiptUpload({ orderId }: ReceiptUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const upload = useUploadReceipt(orderId)

  const pick = () => inputRef.current?.click()

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!f) return

    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error(t('orders.receipt.invalidType'))
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(t('orders.receipt.tooLarge', { mb: MAX_SIZE_MB }))
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }

  const handleUpload = async () => {
    if (!file) return
    try {
      await upload.mutateAsync(file)
      toast.success(t('orders.receipt.uploaded'))
      clear()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleSelect}
        className="hidden"
      />

      {!file && (
        <button
          type="button"
          onClick={pick}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center text-muted-foreground transition-colors hover:border-primary/60 hover:bg-muted/60 hover:text-foreground"
        >
          <Upload className="size-8" />
          <span className="text-sm font-medium">
            {t('orders.receipt.pickFile')}
          </span>
          <span className="text-xs">
            {t('orders.receipt.hint', { mb: MAX_SIZE_MB })}
          </span>
        </button>
      )}

      {file && previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-80 w-full object-contain"
            />
            <button
              type="button"
              onClick={clear}
              disabled={upload.isPending}
              aria-label={t('common.cancel')}
              className="absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </span>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={upload.isPending}
            >
              {upload.isPending && <Loader2 className="animate-spin" />}
              <Upload />
              {t('orders.receipt.upload')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
