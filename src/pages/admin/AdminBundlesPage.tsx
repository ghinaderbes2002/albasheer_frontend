import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Inbox, Loader2, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminBundles,
  useCreateAdminBundle,
  useDeleteAdminBundle,
  useToggleBundleAvailability,
  useUpdateAdminBundle,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminBundle } from '@/types/api'

export function AdminBundlesPage() {
  const { t } = useTranslation()
  const [editBundle, setEditBundle] = useState<AdminBundle | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useAdminBundles()
  const deleteBundle = useDeleteAdminBundle()

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.bundles.confirmDelete'))) return
    try {
      await deleteBundle.mutateAsync(id)
      toast.success(t('admin.bundles.deleted'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.bundles.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.bundles.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.bundles.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.bundles.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.bundles.price')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">Products</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.bundles.available')}</th>
                <th className="px-4 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.image && (
                        <img src={b.image} alt="" className="size-8 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{b.name_ar}</p>
                        <p className="text-xs text-muted-foreground">{b.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" dir="ltr">
                    {Number(b.price).toLocaleString('en-US')} {t('common.currency')}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {b.products?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${b.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_available ? t('admin.bundles.available') : t('catalog.outOfStock')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditBundle(b)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(b.id)}
                        disabled={deleteBundle.isPending}
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

      {(showCreate || editBundle) && (
        <BundleFormDialog
          bundle={editBundle}
          onClose={() => { setShowCreate(false); setEditBundle(null) }}
        />
      )}
    </div>
  )
}

function BundleFormDialog({
  bundle,
  onClose,
}: {
  bundle: AdminBundle | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const create = useCreateAdminBundle()
  const update = useUpdateAdminBundle(bundle?.id ?? 0)
  const toggle = useToggleBundleAvailability(bundle?.id ?? 0)
  const isEdit = !!bundle

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: bundle?.name ?? '',
      name_ar: bundle?.name_ar ?? '',
      description_ar: bundle?.description_ar ?? '',
      price: bundle?.price ?? '',
    },
  })

  const onSubmit = async (values: { name: string; name_ar: string; description_ar: string; price: string }) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values)
        toast.success(t('admin.bundles.updated'))
      } else {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)))
        await create.mutateAsync(fd)
        toast.success(t('admin.bundles.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
      toast.success(t('admin.bundles.updated'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.bundles.editTitle') : t('admin.bundles.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.bundles.nameEn')}>
              <Input {...register('name')} required />
            </Field>
            <Field label={t('admin.bundles.nameAr')}>
              <Input {...register('name_ar')} required />
            </Field>
          </div>
          <Field label={t('admin.bundles.descAr')}>
            <Textarea {...register('description_ar')} rows={2} />
          </Field>
          <Field label={t('admin.bundles.price')}>
            <Input {...register('price')} type="number" min={0} required dir="ltr" />
          </Field>
          <div className="flex gap-2 pt-2 flex-wrap">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="animate-spin size-4" />}
              {t('common.save')}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleToggle}
                disabled={toggle.isPending}
              >
                <Power className="size-4" />
                Toggle
              </Button>
            )}
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
