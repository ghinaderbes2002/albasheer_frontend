import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminBrands,
  useCreateBrand,
  useUpdateAdminBrand,
  useDeleteAdminBrand,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { Brand } from '@/types/api'

export function AdminBrandsPage() {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Brand | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useAdminBrands()
  const deleteBrand = useDeleteAdminBrand()

  // The endpoint returns every brand at once, so filtering here beats a round trip.
  const query = search.trim().toLowerCase()
  const brands = query
    ? data?.filter((b) =>
        [b.name_ar, b.name, b.slug].some((field) =>
          field?.toLowerCase().includes(query),
        ),
      )
    : data

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteBrand.mutateAsync(confirmDelete.id)
      toast.success(t('admin.brands.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.brands.title')}</h1>
        <Button onClick={() => { setEditBrand(null); setShowForm(true) }}>
          <Plus className="size-4" />
          {t('admin.brands.add')}
        </Button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute inset-y-0 inset-e-3 my-auto size-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pe-9"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !brands?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <p>{query ? t('common.noResults') : t('admin.brands.empty')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.brands.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.brands.nameEn')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-end" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-3">
                      {b.logo && (
                        <img src={b.logo} alt={b.name_ar} loading="lazy" decoding="async" width={32} height={32} className="size-8 rounded object-contain bg-muted p-0.5" />
                      )}
                      {b.name_ar}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{b.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{b.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditBrand(b); setShowForm(true) }}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(b)}
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

      {showForm && (
        <BrandFormDialog
          brand={editBrand}
          onClose={() => { setShowForm(false); setEditBrand(null) }}
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
                <h2 className="text-base font-semibold">{t('admin.brands.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.name_ar}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" disabled={deleteBrand.isPending} onClick={handleDelete}>
                {deleteBrand.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BrandFormDialog({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const { t } = useTranslation()
  const isEdit = !!brand
  const create = useCreateBrand()
  const update = useUpdateAdminBrand()
  const pending = create.isPending || update.isPending

  const { register, handleSubmit } = useForm({
    defaultValues: { name: brand?.name ?? '', name_ar: brand?.name_ar ?? '' },
  })

  const onSubmit = async (values: { name: string; name_ar: string }) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: brand.id, payload: values })
        toast.success(t('admin.brands.updated'))
      } else {
        await create.mutateAsync(values)
        toast.success(t('admin.brands.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit
              ? t('admin.brands.editTitle')
              : t('admin.brands.addTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.brands.nameAr')}</Label>
            <Input {...register('name_ar')} required />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.brands.nameEn')}</Label>
            <Input {...register('name')} required dir="ltr" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending && <Loader2 className="size-4 animate-spin" />}
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
