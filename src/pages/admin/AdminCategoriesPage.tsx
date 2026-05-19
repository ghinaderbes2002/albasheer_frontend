import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Inbox, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminCategory } from '@/types/api'

export function AdminCategoriesPage() {
  const { t } = useTranslation()
  const [editCat, setEditCat] = useState<AdminCategory | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminCategory | null>(null)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminCategories()
  const deleteCat = useDeleteAdminCategory()

  const filtered = search.trim()
    ? (data ?? []).filter((c) => {
        const q = search.toLowerCase()
        return (
          c.name_ar.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
        )
      })
    : (data ?? [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteCat.mutateAsync(confirmDelete.id)
      toast.success(t('admin.categories.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.categories.title')}</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute inset-y-0 inset-e-3 my-auto size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pe-9"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreate(true)} className="ms-auto">
          <Plus className="size-4" />
          {t('admin.categories.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState message={search ? t('catalog.empty') : t('admin.categories.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.categories.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.categories.nameEn')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.categories.order')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.categories.active')}</th>
                <th className="px-4 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {c.icon && <img src={c.icon} alt="" className="size-6 rounded object-cover" />}
                      {c.name_ar}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.order}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? t('admin.categories.active') : t('branches.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditCat(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(c)}
                        disabled={deleteCat.isPending}
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

      {(showCreate || editCat) && (
        <CategoryFormDialog
          category={editCat}
          onClose={() => { setShowCreate(false); setEditCat(null) }}
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
                <h2 className="text-base font-semibold">{t('admin.categories.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.name_ar}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteCat.isPending}
                onClick={handleDelete}
              >
                {deleteCat.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button
                variant="outline"
                disabled={deleteCat.isPending}
                onClick={() => setConfirmDelete(null)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryFormDialog({
  category,
  onClose,
}: {
  category: AdminCategory | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const create = useCreateAdminCategory()
  const update = useUpdateAdminCategory(category?.id ?? 0)
  const isEdit = !!category

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: category?.name ?? '',
      name_ar: category?.name_ar ?? '',
      order: category?.order ?? 0,
      is_active: category?.is_active ?? true,
    },
  })

  const onSubmit = async (values: { name: string; name_ar: string; order: number; is_active: boolean }) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values)
        toast.success(t('admin.categories.updated'))
      } else {
        const fd = new FormData()
        fd.append('name', values.name)
        fd.append('name_ar', values.name_ar)
        fd.append('order', String(values.order))
        fd.append('is_active', String(values.is_active))
        await create.mutateAsync(fd)
        toast.success(t('admin.categories.created'))
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
          {isEdit ? t('admin.categories.editTitle') : t('admin.categories.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label={t('admin.categories.nameEn')}>
            <Input {...register('name')} required />
          </Field>
          <Field label={t('admin.categories.nameAr')}>
            <Input {...register('name_ar')} required />
          </Field>
          <Field label={t('admin.categories.order')}>
            <Input {...register('order', { valueAsNumber: true })} type="number" min={0} dir="ltr" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} className="size-4" />
            {t('admin.categories.active')}
          </label>
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
