import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { CreditCard, ImagePlus, Inbox, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminBranches,
  useAdminPaymentMethods,
  useCreateAdminPaymentMethod,
  useDeleteAdminPaymentMethod,
  useUpdateAdminPaymentMethod,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import type { AdminPaymentMethod } from '@/types/api'

export function AdminPaymentMethodsPage() {
  const { t } = useTranslation()
  const [editItem, setEditItem] = useState<AdminPaymentMethod | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminPaymentMethod | null>(null)

  const { data, isLoading } = useAdminPaymentMethods()
  const deleteMethod = useDeleteAdminPaymentMethod()

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteMethod.mutateAsync(confirmDelete.id)
      toast.success(t('admin.paymentMethods.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.paymentMethods.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.paymentMethods.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.paymentMethods.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.paymentMethods.name')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.paymentMethods.branch')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.paymentMethods.description')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.paymentMethods.status')}</th>
                <th className="px-4 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.image
                        ? <img src={resolveMediaUrl(m.image) ?? m.image} alt="" loading="lazy" decoding="async" width={32} height={32} className="size-8 rounded-lg object-cover shrink-0" />
                        : <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                            <CreditCard className="size-4 text-muted-foreground" />
                          </div>
                      }
                      <span className="font-medium">{m.name_ar}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{m.branch_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground max-w-xs truncate">{m.description_ar || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${m.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.is_active ? t('admin.paymentMethods.active') : t('admin.paymentMethods.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditItem(m)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(m)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showCreate || editItem) && (
        <PaymentMethodFormDialog
          item={editItem}
          onClose={() => { setShowCreate(false); setEditItem(null) }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t('admin.paymentMethods.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.name_ar}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" disabled={deleteMethod.isPending} onClick={handleDelete}>
                {deleteMethod.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button variant="outline" disabled={deleteMethod.isPending} onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentMethodFormDialog({
  item,
  onClose,
}: {
  item: AdminPaymentMethod | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: branches } = useAdminBranches()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newImage, setNewImage] = useState<File | null>(null)

  const isEdit = !!item
  const create = useCreateAdminPaymentMethod()
  const update = useUpdateAdminPaymentMethod(item?.id ?? 0)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      branch: item?.branch ?? 0,
      name_ar: item?.name_ar ?? '',
      description_ar: item?.description_ar ?? '',
      link: item?.link ?? '',
      is_active: item?.is_active ?? true,
      order: item?.order ?? 1,
    },
  })

  const onSubmit = async (values: {
    branch: number; name_ar: string; description_ar: string
    link: string; is_active: boolean; order: number
  }) => {
    try {
      if (isEdit) {
        if (newImage) {
          const fd = new FormData()
          Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)))
          fd.append('image', newImage)
          await update.mutateAsync(fd)
        } else {
          await update.mutateAsync(values)
        }
        toast.success(t('admin.paymentMethods.updated'))
      } else {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)))
        if (newImage) fd.append('image', newImage)
        await create.mutateAsync(fd)
        toast.success(t('admin.paymentMethods.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? t('admin.paymentMethods.editTitle') : t('admin.paymentMethods.addTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={pending}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label={t('admin.paymentMethods.branch')}>
            <select
              {...register('branch', { valueAsNumber: true })}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={0}>—</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>{b.name_ar || b.name}</option>
              ))}
            </select>
          </Field>

          <Field label={t('admin.paymentMethods.name')}>
            <Input {...register('name_ar')} required />
          </Field>

          <Field label={t('admin.paymentMethods.description')}>
            <Textarea {...register('description_ar')} rows={2} />
          </Field>

          <Field label={t('admin.paymentMethods.link')}>
            <Input {...register('link')} dir="ltr" placeholder="https://..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.paymentMethods.order')}>
              <Input {...register('order', { valueAsNumber: true })} type="number" min={1} dir="ltr" />
            </Field>
            <Field label=" ">
              <label className="flex h-10 items-center gap-2 text-sm">
                <input type="checkbox" {...register('is_active')} className="size-4" />
                {t('admin.paymentMethods.active')}
              </label>
            </Field>
          </div>

          {/* Image */}
          <Field label={t('admin.paymentMethods.image')}>
            {isEdit && item?.image && !newImage && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={resolveMediaUrl(item.image) ?? item.image}
                  alt=""
                  className="size-12 rounded-lg object-cover border border-border"
                />
                <span className="text-xs text-muted-foreground">{t('admin.paymentMethods.currentImage')}</span>
              </div>
            )}
            {newImage && (
              <div className="mb-2 flex items-center gap-2">
                <img src={URL.createObjectURL(newImage)} alt="" className="size-12 rounded-lg object-cover border border-border" />
                <button type="button" onClick={() => setNewImage(null)} className="text-xs text-destructive hover:underline">
                  {t('common.cancel')}
                </button>
              </div>
            )}
            <div
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              <span>{newImage ? t('admin.paymentMethods.changeImage') : t('admin.paymentMethods.uploadImage')}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setNewImage(e.target.files[0])}
            />
          </Field>

          <div className="flex gap-2 pt-1">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Inbox className="size-10" />
      <p>{message}</p>
    </div>
  )
}
