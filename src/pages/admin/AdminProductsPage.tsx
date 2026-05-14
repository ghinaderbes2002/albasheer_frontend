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
  useAdminCategories,
  useAdminProducts,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useToggleProductAvailability,
  useUpdateAdminProduct,
} from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminProduct } from '@/types/api'

export function AdminProductsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: categories } = useAdminCategories()
  const { data, isLoading } = useAdminProducts({
    search: search || undefined,
    category: categoryFilter || undefined,
  })
  const deleteProduct = useDeleteAdminProduct()
  const toggle = useToggleProductAvailability(editProduct?.id ?? 0)

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.products.confirmDelete'))) return
    try {
      await deleteProduct.mutateAsync(id)
      toast.success(t('admin.products.deleted'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleToggle = async (product: AdminProduct) => {
    try {
      await useToggleProductAvailability(product.id).mutateAsync()
      toast.success(t('admin.products.updated'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.products.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.products.add')}
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          className="w-full sm:w-64"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t('common.all')}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name_ar}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.products.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.nameAr')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.products.price')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.products.category')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.available')}</th>
                <th className="px-4 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.main_image && (
                        <img src={p.main_image} alt="" className="size-8 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{p.name_ar}</p>
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" dir="ltr">
                    {Number(p.price).toLocaleString()} {t('common.currency')}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {p.category_name ?? p.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_available ? t('admin.products.available') : t('catalog.outOfStock')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditProduct(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteProduct.isPending}
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

      {(showCreate || editProduct) && (
        <ProductFormDialog
          product={editProduct}
          onClose={() => { setShowCreate(false); setEditProduct(null) }}
        />
      )}
    </div>
  )
}

function ProductFormDialog({
  product,
  onClose,
}: {
  product: AdminProduct | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: categories } = useAdminCategories()
  const create = useCreateAdminProduct()
  const update = useUpdateAdminProduct(product?.id ?? 0)
  const toggle = useToggleProductAvailability(product?.id ?? 0)
  const isEdit = !!product

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: product?.name ?? '',
      name_ar: product?.name_ar ?? '',
      description: product?.description ?? '',
      description_ar: product?.description_ar ?? '',
      price: product?.price ?? '',
      category: product?.category ?? 0,
      is_available: product?.is_available ?? true,
      is_featured: product?.is_featured ?? false,
    },
  })

  const onSubmit = async (values: {
    name: string; name_ar: string; description: string; description_ar: string
    price: string; category: number; is_available: boolean; is_featured: boolean
  }) => {
    try {
      if (isEdit) {
        await update.mutateAsync({
          name: values.name,
          name_ar: values.name_ar,
          description: values.description,
          description_ar: values.description_ar,
          price: values.price,
          category: values.category,
          is_featured: values.is_featured,
        })
        toast.success(t('admin.products.updated'))
      } else {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)))
        await create.mutateAsync(fd)
        toast.success(t('admin.products.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
      toast.success(t('admin.products.updated'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.products.editTitle') : t('admin.products.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.products.nameEn')}>
              <Input {...register('name')} required />
            </Field>
            <Field label={t('admin.products.nameAr')}>
              <Input {...register('name_ar')} required />
            </Field>
          </div>
          <Field label={t('admin.products.descEn')}>
            <Textarea {...register('description')} rows={2} />
          </Field>
          <Field label={t('admin.products.descAr')}>
            <Textarea {...register('description_ar')} rows={2} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('admin.products.price')}>
              <Input {...register('price')} type="number" min={0} required dir="ltr" />
            </Field>
            <Field label={t('admin.products.category')}>
              <select
                {...register('category', { valueAsNumber: true })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={0}>—</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_featured')} className="size-4" />
              {t('admin.products.featured')}
            </label>
          </div>
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
                {t('admin.products.toggleAvailability')}
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
