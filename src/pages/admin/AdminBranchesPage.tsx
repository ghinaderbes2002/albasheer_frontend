import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Inbox, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminBranches,
  useCreateAdminBranch,
  useDeleteAdminBranch,
  useUpdateAdminBranch,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminBranch } from '@/types/api'

type BranchForm = Omit<AdminBranch, 'id'>

export function AdminBranchesPage() {
  const { t } = useTranslation()
  const [editBranch, setEditBranch] = useState<AdminBranch | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useAdminBranches()
  const deleteBranch = useDeleteAdminBranch()

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.branches.confirmDelete'))) return
    try {
      await deleteBranch.mutateAsync(id)
      toast.success(t('admin.branches.deleted'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.branches.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.branches.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.branches.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.branches.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.branches.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                  <td className="px-4 py-3 font-medium">{b.name_ar}</td>
                  <td className="px-4 py-3 hidden sm:table-cell" dir="ltr">{b.phone}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? t('admin.branches.active') : t('branches.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditBranch(b)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(b.id)}
                        disabled={deleteBranch.isPending}
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

      {(showCreate || editBranch) && (
        <BranchFormDialog
          branch={editBranch}
          onClose={() => { setShowCreate(false); setEditBranch(null) }}
        />
      )}
    </div>
  )
}

function BranchFormDialog({
  branch,
  onClose,
}: {
  branch: AdminBranch | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const create = useCreateAdminBranch()
  const update = useUpdateAdminBranch(branch?.id ?? 0)
  const isEdit = !!branch

  const { register, handleSubmit } = useForm<BranchForm>({
    defaultValues: {
      name: branch?.name ?? '',
      name_ar: branch?.name_ar ?? '',
      address: branch?.address ?? '',
      phone: branch?.phone ?? '',
      maps_url: branch?.maps_url ?? '',
      is_active: branch?.is_active ?? true,
      is_primary: branch?.is_primary ?? false,
    },
  })

  const onSubmit = async (values: BranchForm) => {
    try {
      if (isEdit) {
        await update.mutateAsync(values)
        toast.success(t('admin.branches.updated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('admin.branches.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.branches.editTitle') : t('admin.branches.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label={t('admin.branches.nameEn')}>
            <Input {...register('name')} required />
          </Field>
          <Field label={t('admin.branches.nameAr')}>
            <Input {...register('name_ar')} required />
          </Field>
          <Field label={t('admin.branches.address')}>
            <Input {...register('address')} />
          </Field>
          <Field label={t('admin.branches.phone')}>
            <Input {...register('phone')} dir="ltr" />
          </Field>
          <Field label={t('admin.branches.mapsUrl')}>
            <Input {...register('maps_url')} dir="ltr" />
          </Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_active')} className="size-4" />
              {t('admin.branches.active')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_primary')} className="size-4" />
              {t('admin.branches.primary')}
            </label>
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
