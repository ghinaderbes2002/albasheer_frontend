import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { CreditCard, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useBranchPaymentMethods,
  useCreateBranchPaymentMethod,
  useDeleteBranchPaymentMethod,
  useUpdateBranchPaymentMethod,
} from '@/features/paymentMethods/queries'
import { extractApiError } from '@/lib/api'
import type { PaymentMethod, PaymentMethodPayload } from '@/types/api'

export function BranchPaymentMethodsPage() {
  const { t } = useTranslation()
  const [editMethod, setEditMethod] = useState<PaymentMethod | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useBranchPaymentMethods()
  const deleteMethod = useDeleteBranchPaymentMethod()

  const handleDelete = async (id: number) => {
    if (!confirm(t('paymentMethods.confirmDelete'))) return
    try {
      await deleteMethod.mutateAsync(id)
      toast.success(t('paymentMethods.deleted'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold md:text-3xl">{t('paymentMethods.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('paymentMethods.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('paymentMethods.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <CreditCard className="size-10" />
          <p>{t('paymentMethods.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <div
              key={m.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{m.name_ar}</p>
                  {!m.is_active && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {t('branches.inactive')}
                    </span>
                  )}
                </div>
                {m.description_ar && (
                  <p className="text-sm text-muted-foreground">{m.description_ar}</p>
                )}
                {m.link && (
                  <p className="text-xs text-primary truncate" dir="ltr">{m.link}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditMethod(m)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(m.id)}
                  disabled={deleteMethod.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreate || editMethod) && (
        <PaymentMethodDialog
          method={editMethod}
          onClose={() => { setShowCreate(false); setEditMethod(null) }}
        />
      )}
    </div>
  )
}

function PaymentMethodDialog({
  method,
  onClose,
}: {
  method: PaymentMethod | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const create = useCreateBranchPaymentMethod()
  const update = useUpdateBranchPaymentMethod(method?.id ?? 0)
  const isEdit = !!method

  const { register, handleSubmit } = useForm<PaymentMethodPayload>({
    defaultValues: {
      name_ar: method?.name_ar ?? '',
      description_ar: method?.description_ar ?? '',
      link: method?.link ?? '',
      is_active: method?.is_active ?? true,
      order: method?.order ?? 0,
    },
  })

  const onSubmit = async (values: PaymentMethodPayload) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values)
        toast.success(t('paymentMethods.updated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('paymentMethods.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('paymentMethods.editTitle') : t('paymentMethods.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('paymentMethods.nameAr')} *</Label>
            <Input {...register('name_ar')} required />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('paymentMethods.description')}</Label>
            <Textarea {...register('description_ar')} rows={2} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('paymentMethods.link')}</Label>
            <Input {...register('link')} dir="ltr" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_active')} className="size-4" />
              {t('paymentMethods.active')}
            </label>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">{t('paymentMethods.order')}</Label>
              <Input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min={0}
                className="w-16"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="animate-spin size-4" />}
              {t('common.save')}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
