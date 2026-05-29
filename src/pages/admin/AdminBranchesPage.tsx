import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { ExternalLink, Inbox, Loader2, MapPin, Pencil, Phone, Plus, Search, Trash2, X } from 'lucide-react'
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
  const [viewBranch, setViewBranch] = useState<AdminBranch | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminBranch | null>(null)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminBranches()

  const filtered = search.trim()
    ? (data ?? []).filter((b) => {
        const q = search.toLowerCase()
        return (
          b.name_ar.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
        )
      })
    : (data ?? [])
  const deleteBranch = useDeleteAdminBranch()

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteBranch.mutateAsync(confirmDelete.id)
      toast.success(t('admin.branches.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.branches.title')}</h1>
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
          {t('admin.branches.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState message={search ? t('catalog.empty') : t('admin.branches.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground w-12">ID</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.branches.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.branches.city')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.branches.phone')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden lg:table-cell">{t('admin.branches.address')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.branches.status')}</th>
                <th className="px-4 py-3 text-end font-medium text-muted-foreground w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setViewBranch(b)}
                >
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">#{b.id}</td>
                  <td className="px-4 py-3 font-medium">{b.name_ar || b.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{b.city || '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell" dir="ltr">{b.phone || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground truncate max-w-[200px]">{b.address || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? t('admin.branches.active') : t('branches.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditBranch(b)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(b)}
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

      {viewBranch && (
        <BranchDetailModal
          branch={viewBranch}
          onClose={() => setViewBranch(null)}
          onEdit={() => { setEditBranch(viewBranch); setViewBranch(null) }}
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
                <h2 className="text-base font-semibold">{t('admin.branches.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.name_ar}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteBranch.isPending}
                onClick={handleDelete}
              >
                {deleteBranch.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button
                variant="outline"
                disabled={deleteBranch.isPending}
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

function BranchDetailModal({
  branch,
  onClose,
  onEdit,
}: {
  branch: AdminBranch
  onClose: () => void
  onEdit: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{branch.name_ar}</h2>
            <p className="text-xs text-muted-foreground" dir="ltr">{branch.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-2.5 px-6 py-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${branch.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {branch.is_active ? t('admin.branches.active') : t('branches.inactive')}
            </span>
            {branch.is_primary && (
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {t('admin.branches.primary')}
              </span>
            )}
          </div>

          <DetailRow label="ID">
            <span dir="ltr" className="text-sm font-medium">#{branch.id}</span>
          </DetailRow>

          {branch.address && (
            <DetailRow label={t('admin.branches.address')} icon={<MapPin className="size-3.5" />}>
              <span className="text-sm">{branch.address}</span>
            </DetailRow>
          )}

          {branch.phone && (
            <DetailRow label={t('admin.branches.phone')} icon={<Phone className="size-3.5" />}>
              <a href={`tel:${branch.phone}`} dir="ltr" className="text-sm text-primary hover:underline">
                {branch.phone}
              </a>
            </DetailRow>
          )}

          {branch.maps_url && (
            <DetailRow label={t('admin.branches.mapsUrl')} icon={<ExternalLink className="size-3.5" />}>
              <a
                href={branch.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t('admin.branches.viewOnMap')}
              </a>
            </DetailRow>
          )}
        </div>

        <div className="flex gap-2 border-t border-border px-6 py-4">
          <Button className="flex-1" onClick={onEdit}>
            <Pencil className="size-4" />
            {t('common.edit')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
      {icon && <span className="mt-0.5 text-muted-foreground flex-shrink-0">{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {children}
      </div>
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
            <Input {...register('maps_url')} dir="ltr" placeholder="https://maps.google.com/..." />
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
