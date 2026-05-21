import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ImagePlus, Loader2, Pencil, Plus, Power, Star, Trash2, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminProduct,
  useDeleteProductImage,
  useToggleProductAvailability,
  useUpdateAdminProductSpecs,
  useUploadProductImages,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductSpec } from '@/types/api'
import { ProductFormDialog } from './AdminProductsPage'

export function AdminProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showSpecsEdit, setShowSpecsEdit] = useState(false)

  const { data: product, isLoading } = useAdminProduct(id)
  const uploadImages = useUploadProductImages(id ?? '')
  const deleteImage = useDeleteProductImage(id ?? '')
  const toggle = useToggleProductAvailability(id ?? '')

  const handleUploadImages = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('image', file)
        await uploadImages.mutateAsync(fd)
      }
      toast.success(t('admin.products.imageUploaded'))
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync(imageId)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
      toast.success(t('admin.products.updated'))
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

  if (!product) {
    return <p className="text-muted-foreground">{t('errors.notFound')}</p>
  }

  const mainImg = product.images.find((i) => i.is_main) ?? product.images[0]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate(`${basePath}/products`)}>
          <ChevronRight className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold truncate">{product.name_ar}</h1>
        <div className="ms-auto flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleToggle}
            disabled={toggle.isPending}
          >
            {toggle.isPending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
            {t('admin.products.toggleAvailability')}
          </Button>
          <Button onClick={() => setShowEdit(true)}>
            <Pencil className="size-4" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Main info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main image */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
          {mainImg ? (
            <img
              src={resolveMediaUrl(mainImg.image) ?? mainImg.image}
              alt={product.name_ar}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImagePlus className="size-16 text-muted-foreground/30" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {product.is_available ? t('admin.products.available') : t('catalog.outOfStock')}
            </span>
            {product.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Star className="size-3" />
                {t('admin.products.featured')}
              </span>
            )}
          </div>

          <div>
            <p className="text-xl font-bold">{product.name_ar}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">{product.name}</p>
          </div>

          <p className="text-3xl font-extrabold text-primary" dir="ltr">
            {Number(product.price).toLocaleString()}{' '}
            <span className="text-base font-medium text-muted-foreground">{t('common.currency')}</span>
          </p>

          {product.category_name && (
            <p className="text-sm text-muted-foreground">
              {t('admin.products.category')}:{' '}
              <span className="font-medium text-foreground">{product.category_name}</span>
            </p>
          )}

          {product.description_ar && (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-sm leading-relaxed">{product.description_ar}</p>
            </div>
          )}

          {product.description && (
            <div className="rounded-xl border border-border bg-muted/30 p-3" dir="ltr">
              <p className="text-left text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
          <h2 className="font-semibold">{t('catalog.specs')}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowSpecsEdit(true)}>
            <Pencil className="size-3.5" />
            {t('admin.products.editSpecs')}
          </Button>
        </div>
        {product.specs?.length > 0 ? (
          <div className="divide-y divide-border">
            {product.specs.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                <span className="w-1/3 font-medium text-muted-foreground">{s.key_ar}</span>
                <span>{s.value_ar}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('admin.products.noSpecs')}</p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('admin.products.images')}</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImages.isPending}
          >
            {uploadImages.isPending
              ? <Loader2 className="size-4 animate-spin" />
              : <ImagePlus className="size-4" />
            }
            {t('admin.products.addImage')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files?.length && handleUploadImages(e.target.files)}
          />
        </div>

        {product.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {product.images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                <img
                  src={resolveMediaUrl(img.image) ?? img.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {img.is_main && (
                  <span className="absolute inset-s-2 top-2 rounded-lg bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {t('admin.products.mainImage')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deleteImage.isPending}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-6 text-white drop-shadow" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-14 text-center text-muted-foreground">
            <ImagePlus className="size-10" />
            <p className="text-sm">{t('admin.products.noImages')}</p>
          </div>
        )}
      </div>

      {showEdit && (
        <ProductFormDialog
          product={product}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showSpecsEdit && (
        <SpecsEditorDialog
          productId={id!}
          specs={product.specs ?? []}
          onClose={() => setShowSpecsEdit(false)}
        />
      )}
    </div>
  )
}

function SpecsEditorDialog({
  productId,
  specs,
  onClose,
}: {
  productId: string
  specs: ProductSpec[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [rows, setRows] = useState(
    specs.map((s) => ({ key: s.key, key_ar: s.key_ar, value: s.value, value_ar: s.value_ar })),
  )
  const update = useUpdateAdminProductSpecs(productId)

  const addRow = () => setRows((r) => [...r, { key: '', key_ar: '', value: '', value_ar: '' }])
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i))
  const setField = (i: number, field: string, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)))

  const handleSave = async () => {
    try {
      await update.mutateAsync(rows)
      toast.success(t('admin.products.specsUpdated'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('admin.products.editSpecs')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={update.isPending}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {rows.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
              <Label className="text-xs text-muted-foreground">{t('admin.products.specKeyAr')}</Label>
              <Label className="text-xs text-muted-foreground">{t('admin.products.specValueAr')}</Label>
              <Label className="text-xs text-muted-foreground" dir="ltr">{t('admin.products.specKey')}</Label>
              <Label className="text-xs text-muted-foreground" dir="ltr">{t('admin.products.specValue')}</Label>
              <span />
            </div>
          )}
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <Input value={row.key_ar} onChange={(e) => setField(i, 'key_ar', e.target.value)} placeholder="مثال: اللون" />
              <Input value={row.value_ar} onChange={(e) => setField(i, 'value_ar', e.target.value)} placeholder="مثال: أبيض" />
              <Input value={row.key} onChange={(e) => setField(i, 'key', e.target.value)} dir="ltr" placeholder="Color" />
              <Input value={row.value} onChange={(e) => setField(i, 'value', e.target.value)} dir="ltr" placeholder="White" />
              <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeRow(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addRow} className="w-full mt-1">
            <Plus className="size-4" />
            {t('admin.products.addSpec')}
          </Button>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleSave} disabled={update.isPending} className="flex-1">
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            {t('common.save')}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
