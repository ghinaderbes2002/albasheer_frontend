import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ImageOff, Loader2, Plus, Power, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  useAdminBundle,
  useToggleBundleAvailability,
  useAddProductToBundle,
  useRemoveProductFromBundle,
  useAdminProducts,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'

export function AdminBundleDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'

  const [showAddProduct, setShowAddProduct] = useState(false)

  const { data: bundle, isLoading } = useAdminBundle(id)
  const toggle = useToggleBundleAvailability(id ?? '')
  const removeProduct = useRemoveProductFromBundle(id ?? '')

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
      toast.success(t('admin.bundles.updated'))
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!bundle) {
    return <p className="text-muted-foreground">{t('errors.notFound')}</p>
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate(`${basePath}/bundles`)}>
          <ChevronRight className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold truncate">{bundle.name_ar}</h1>
        <div className="ms-auto flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleToggle} disabled={toggle.isPending}>
            {toggle.isPending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
            {bundle.is_available
              ? t('admin.products.toggleAvailability')
              : t('admin.products.toggleAvailability')}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
          {bundle.image ? (
            <img src={resolveMediaUrl(bundle.image) ?? bundle.image} alt={bundle.name_ar} loading="lazy" decoding="async" width={600} height={600} className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="size-16 text-muted-foreground/30" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${bundle.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {bundle.is_available ? t('admin.bundles.available') : t('catalog.outOfStock')}
            </span>
          </div>

          <div>
            <p className="text-xl font-bold">{bundle.name_ar}</p>
            <p className="text-sm text-muted-foreground">{bundle.name}</p>
          </div>

          <p className="text-3xl font-extrabold text-primary" dir="ltr">
            {Number(bundle.price).toLocaleString()}{' '}
            <span className="text-base font-medium text-muted-foreground">{t('common.currency')}</span>
          </p>

          {bundle.description_ar && (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-sm leading-relaxed">{bundle.description_ar}</p>
            </div>
          )}
          {bundle.description && (
            <div className="rounded-xl border border-border bg-muted/30 p-3" dir="ltr">
              <p className="text-left text-sm leading-relaxed text-muted-foreground">{bundle.description}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {t('admin.products.createdAt', { defaultValue: 'تاريخ الإنشاء' })}:{' '}
            {new Date(bundle.created_at).toLocaleDateString('ar-SY')}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
          <h2 className="font-semibold">
            {t('admin.nav.products')}
            <span className="ms-2 text-sm font-normal text-muted-foreground">({bundle.products.length})</span>
          </h2>
          <Button size="sm" variant="outline" onClick={() => setShowAddProduct(true)}>
            <Plus className="size-3.5" />
            {t('admin.bundles.addProduct', { defaultValue: 'إضافة منتج' })}
          </Button>
        </div>

        {bundle.products.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t('admin.bundles.noProducts', { defaultValue: 'لا توجد منتجات في هذه الباقة' })}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {bundle.products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  {p.main_image ? (
                    <img src={resolveMediaUrl(p.main_image) ?? p.main_image} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="size-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.name_ar}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {Number(p.price).toLocaleString('en-US')} {t('common.currency')}
                  </p>
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
            ))}
          </div>
        )}
      </div>

      {showAddProduct && (
        <AddProductDialog
          bundleId={id!}
          existingIds={bundle.products.map((p) => p.id)}
          onClose={() => setShowAddProduct(false)}
        />
      )}
    </div>
  )
}

function AddProductDialog({
  bundleId,
  existingIds,
  onClose,
}: {
  bundleId: string
  existingIds: number[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const addProduct = useAddProductToBundle(bundleId)
  const { data: allProducts } = useAdminProducts({ search: search || undefined })

  const candidates = (allProducts ?? []).filter((p) => !existingIds.includes(p.id))

  const handleAdd = async (productId: number) => {
    try {
      await addProduct.mutateAsync(productId)
      toast.success(t('admin.bundles.productAdded', { defaultValue: 'تمت إضافة المنتج' }))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">{t('admin.bundles.addProduct', { defaultValue: 'إضافة منتج للباقة' })}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>
        <div className="p-4 border-b border-border">
          <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
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
                {addProduct.isPending ? <Loader2 className="size-4 animate-spin shrink-0" /> : <Plus className="size-4 text-muted-foreground shrink-0" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
