import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ImagePlus, Loader2, Pencil, Power, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminProduct,
  useDeleteProductImage,
  useToggleProductAvailability,
  useUploadProductImages,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import { ProductFormDialog } from './AdminProductsPage'

export function AdminProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEdit, setShowEdit] = useState(false)

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
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
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
      {product.specs?.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="bg-muted/40 px-4 py-3">
            <h2 className="font-semibold">{t('catalog.specs')}</h2>
          </div>
          <div className="divide-y divide-border">
            {product.specs.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                <span className="w-1/3 font-medium text-muted-foreground">{s.key_ar}</span>
                <span>{s.value_ar}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  )
}
