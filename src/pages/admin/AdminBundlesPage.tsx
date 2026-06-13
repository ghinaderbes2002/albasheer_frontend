import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { ImageOff, Inbox, Loader2, Pencil, Plus, Power, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminBundles,
  useAdminBundle,
  useCreateAdminBundle,
  useDeleteAdminBundle,
  useToggleBundleAvailability,
  useUpdateAdminBundle,
  useAddProductToBundle,
  useRemoveProductFromBundle,
  useAdminProducts,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import type { AdminBundle } from '@/types/api'
import { Price } from '@/components/shared/Price'

export function AdminBundlesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const [editBundle, setEditBundle] = useState<AdminBundle | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [manageBundle, setManageBundle] = useState<AdminBundle | null>(null)
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
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.nav.products')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.bundles.available')}</th>
                <th className="px-4 py-3 text-end" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((b) => (
                <BundleRow
                  key={b.id}
                  bundle={b}
                  onClick={() => navigate(`${basePath}/bundles/${b.id}`)}
                  onEdit={() => setEditBundle(b)}
                  onManage={() => setManageBundle(b)}
                  onDelete={() => handleDelete(b.id)}
                  deleteDisabled={deleteBundle.isPending}
                />
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

      {manageBundle && (
        <ManageProductsDialog
          bundle={manageBundle}
          onClose={() => setManageBundle(null)}
        />
      )}
    </div>
  )
}

function BundleRow({
  bundle: b,
  onClick,
  onEdit,
  onManage,
  onDelete,
  deleteDisabled,
}: {
  bundle: AdminBundle
  onClick: () => void
  onEdit: () => void
  onManage: () => void
  onDelete: () => void
  deleteDisabled: boolean
}) {
  const { t } = useTranslation()
  const toggle = useToggleBundleAvailability(b.id)

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
      toast.success(t('admin.bundles.updated'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={onClick}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {b.image
            ? <img src={resolveMediaUrl(b.image) ?? b.image} alt="" loading="lazy" decoding="async" width={32} height={32} className="size-8 rounded object-cover shrink-0" />
            : <div className="size-8 rounded bg-muted shrink-0 flex items-center justify-center"><ImageOff className="size-4 text-muted-foreground/40" /></div>
          }
          <div>
            <p className="font-medium">{b.name_ar}</p>
            <p className="text-xs text-muted-foreground">{b.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Price value={b.price} />
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
        {b.product_count ?? 0}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${b.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {b.is_available ? t('admin.bundles.available') : t('catalog.outOfStock')}
        </span>
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" title={t('admin.nav.products')} onClick={onManage}>
            <Plus className="size-4" />
          </Button>
          <Button
            variant="ghost" size="icon"
            title={t('admin.products.toggleAvailability')}
            onClick={handleToggle}
            disabled={toggle.isPending}
          >
            {toggle.isPending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            disabled={deleteDisabled}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function ManageProductsDialog({
  bundle,
  onClose,
}: {
  bundle: AdminBundle
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'current' | 'add'>('current')

  const { data: detail, isLoading: detailLoading } = useAdminBundle(bundle.id)
  const addProduct = useAddProductToBundle(bundle.id)
  const removeProduct = useRemoveProductFromBundle(bundle.id)
  const { data: allProducts } = useAdminProducts({ search: search || undefined })

  const currentProducts = detail?.products ?? []
  const currentIds = new Set(currentProducts.map((p) => p.id))
  const candidates = (allProducts ?? []).filter((p) => !currentIds.has(p.id))

  const handleAdd = async (productId: number) => {
    try {
      await addProduct.mutateAsync(productId)
      toast.success(t('admin.bundles.productAdded', { defaultValue: 'تمت إضافة المنتج' }))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleRemove = async (productId: number) => {
    try {
      await removeProduct.mutateAsync(productId)
      toast.success(t('admin.bundles.productRemoved', { defaultValue: 'تم حذف المنتج من الباقة' }))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-background shadow-xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">{bundle.name_ar}</h2>
            <p className="text-xs text-muted-foreground">{t('admin.bundles.manageProducts', { defaultValue: 'إدارة المنتجات' })}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab('current')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'current' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('admin.bundles.currentProducts', { defaultValue: 'المنتجات الحالية' })} ({currentProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'add' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('admin.bundles.addProduct', { defaultValue: 'إضافة منتج' })}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {tab === 'current' ? (
            detailLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : !currentProducts.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.bundles.noProducts', { defaultValue: 'لا توجد منتجات في هذه الباقة' })}</p>
            ) : (
              currentProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.main_image
                      ? <img src={resolveMediaUrl(p.main_image) ?? p.main_image} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center"><ImageOff className="size-4 text-muted-foreground/30" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.name_ar}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{Number(p.price).toLocaleString('en-US')}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                    disabled={removeProduct.isPending}
                    onClick={() => handleRemove(p.id)}
                  >
                    {removeProduct.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  </Button>
                </div>
              ))
            )
          ) : (
            <>
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {candidates.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t('admin.variants.noProducts')}</p>
              ) : (
                candidates.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={addProduct.isPending}
                    onClick={() => handleAdd(p.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-start hover:bg-muted/30 transition-colors disabled:opacity-60"
                  >
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.main_image
                        ? <img src={resolveMediaUrl(p.main_image) ?? p.main_image} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center"><ImageOff className="size-4 text-muted-foreground/30" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{p.name_ar}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{Number(p.price).toLocaleString('en-US')}</p>
                    </div>
                    <Plus className="size-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>
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

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? t('admin.bundles.editTitle') : t('admin.bundles.addTitle')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>
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
