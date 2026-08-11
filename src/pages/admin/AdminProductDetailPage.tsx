import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ChevronRight, ImagePlus, Loader2, Link2, Pencil, Plus, Power, Star, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const { isAxiosError } = axios

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminProduct,
  useDeleteProductImage,
  useToggleProductAvailability,
  useUpdateAdminProductSpecs,
  useUploadProductImages,
  useProductVariants,
  useAddProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
  useUploadVariantImage,
  useDeleteVariantImage,
  useRelatedProducts,
  useAddRelatedProduct,
  useRemoveRelatedProduct,
  useAdminVariantTypes,
  useAdminVariantOptions,
  useAdminProducts,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductSpec, ProductVariant } from '@/types/api'
import { ProductFormDialog } from './AdminProductsPage'
import { Price } from '@/components/shared/Price'
import { stockBadgeClass, stockLevel } from '@/lib/stock'

export function AdminProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showSpecsEdit, setShowSpecsEdit] = useState(false)
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null)
  const [showAddRelated, setShowAddRelated] = useState(false)

  const { data: product, isLoading } = useAdminProduct(id)
  const uploadImages = useUploadProductImages(id ?? '')
  const deleteImage = useDeleteProductImage(id ?? '')
  const toggle = useToggleProductAvailability(id ?? '')
  const deleteVariant = useDeleteProductVariant(id ?? '')
  const removeRelated = useRemoveRelatedProduct(id ?? '')
  const { data: variants } = useProductVariants(id)
  const { data: relatedProducts } = useRelatedProducts(id)

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
      // Backend deletes the image but returns 500 — image is gone, skip error toast
      if (!isAxiosError(err) || err.response?.status !== 500) {
        toast.error(extractApiError(err, t('errors.generic')))
      }
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

          <Price value={product.price} className="text-3xl font-extrabold text-primary" />

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {product.category_name && (
              <span>
                {t('admin.products.category')}:{' '}
                <span className="font-medium text-foreground">{product.category_name}</span>
              </span>
            )}
            {product.brand_name && (
              <span>
                {t('admin.products.brand', { defaultValue: 'الشركة' })}:{' '}
                <span className="font-medium text-foreground">{product.brand_name}</span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockBadgeClass[stockLevel(product.stock_quantity)]}`}
            >
              {product.stock_quantity > 0
                ? `${t('admin.products.stockQuantity', { defaultValue: 'الكمية في المخزن' })}: ${product.stock_quantity}`
                : t('admin.products.outOfStock', { defaultValue: 'غير متوفر في المخزن' })}
            </span>
          </div>

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
          {(product.seo_title || product.meta_description) && (
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
              {product.seo_title && (
                <p className="text-xs text-muted-foreground">
                  SEO: <span className="font-medium text-foreground">{product.seo_title}</span>
                </p>
              )}
              {product.meta_description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{product.meta_description}</p>
              )}
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

      {/* Variants */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
          <h2 className="font-semibold">{t('admin.variants.productVariants')}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowAddVariant(true)}>
            <Plus className="size-3.5" />
            {t('admin.variants.addVariant')}
          </Button>
        </div>
        {!variants?.length ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('admin.variants.noVariants')}</p>
        ) : (
          <div className="divide-y divide-border">
            {variants.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                productId={id!}
                onEdit={() => setEditVariant(v)}
                onDelete={async () => {
                  try {
                    await deleteVariant.mutateAsync(v.id)
                    toast.success(t('admin.variants.variantDeleted'))
                  } catch (err) {
                    toast.error(extractApiError(err, t('errors.generic')))
                  }
                }}
                deleteDisabled={deleteVariant.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
          <h2 className="font-semibold">{t('admin.variants.relatedProducts')}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowAddRelated(true)}>
            <Link2 className="size-3.5" />
            {t('admin.variants.addRelated')}
          </Button>
        </div>
        {!relatedProducts?.length ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('admin.variants.noRelated')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="group relative overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-square bg-muted">
                  {rp.main_image ? (
                    <img src={resolveMediaUrl(rp.main_image) ?? rp.main_image} alt={rp.name_ar} loading="lazy" decoding="async" width={120} height={120} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImagePlus className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-1">{rp.name_ar}</p>
                  <Price value={rp.price} className="text-xs text-muted-foreground" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeRelated.mutateAsync(rp.id)
                      toast.success(t('admin.variants.relatedRemoved'))
                    } catch (err) {
                      toast.error(extractApiError(err, t('errors.generic')))
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-6 text-white drop-shadow" />
                </button>
              </div>
            ))}
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

      {(showAddVariant || editVariant) && (
        <VariantFormDialog
          productId={id!}
          variant={editVariant}
          onClose={() => { setShowAddVariant(false); setEditVariant(null) }}
        />
      )}

      {showAddRelated && (
        <AddRelatedDialog
          productId={id!}
          existingIds={relatedProducts?.map((r) => r.id) ?? []}
          onClose={() => setShowAddRelated(false)}
        />
      )}
    </div>
  )
}

function VariantRow({
  variant: v,
  productId,
  onEdit,
  onDelete,
  deleteDisabled,
}: {
  variant: ProductVariant
  productId: string
  onEdit: () => void
  onDelete: () => void
  deleteDisabled: boolean
}) {
  const { t } = useTranslation()
  const deleteImg = useDeleteVariantImage(productId)
  const uploadImg = useUploadVariantImage(productId)
  const imgRef = useRef<HTMLInputElement>(null)
  const mainImage = v.images?.find((i) => i.is_main) ?? v.images?.[0]

  const handleUploadImg = async (file: File) => {
    const fd = new FormData()
    fd.append('image', file)
    try {
      await uploadImg.mutateAsync({ variantId: v.id, formData: fd })
      toast.success(t('admin.variants.variantUpdated'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleDeleteImg = async (imageId: number) => {
    try {
      await deleteImg.mutateAsync(imageId)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 text-sm">
      {/* Image thumbnail */}
      <div className="relative shrink-0">
        {mainImage ? (
          <div className="group relative size-14 overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={resolveMediaUrl(mainImage.image) ?? mainImage.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              disabled={deleteImg.isPending}
              onClick={() => handleDeleteImg(mainImage.id)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            disabled={uploadImg.isPending}
            className="flex size-14 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {uploadImg.isPending
              ? <Loader2 className="size-4 animate-spin" />
              : <ImagePlus className="size-4" />}
          </button>
        )}
        {mainImage && (
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            disabled={uploadImg.isPending}
            className="absolute -bottom-1 -inset-e-1 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary shadow-sm"
            title={t('admin.variants.uploadImage')}
          >
            {uploadImg.isPending ? <Loader2 className="size-2.5 animate-spin" /> : <ImagePlus className="size-2.5" />}
          </button>
        )}
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUploadImg(e.target.files[0])}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium">
          {v.option.value_ar}
          <span className="ms-1 text-muted-foreground text-xs">({v.option.value})</span>
        </p>
        <Price value={v.price} className="text-xs text-muted-foreground" />
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('admin.variants.stock')}: {v.stock}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${v.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {v.is_available ? t('admin.products.available') : t('catalog.outOfStock')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function VariantFormDialog({
  productId,
  variant,
  onClose,
}: {
  productId: string
  variant: ProductVariant | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isEdit = !!variant
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('')
  const [optionId, setOptionId] = useState<number | ''>(variant ? (variant.option.variant_type ?? '') : '')
  const [price, setPrice] = useState(variant ? String(variant.price) : '')
  const [stock, setStock] = useState(variant ? String(variant.stock) : '0')
  const [isAvailable, setIsAvailable] = useState(variant ? variant.is_available : true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  const { data: types } = useAdminVariantTypes()
  const { data: options } = useAdminVariantOptions(selectedTypeId || undefined)
  const addVariant = useAddProductVariant(productId)
  const updateVariant = useUpdateProductVariant(productId)
  const uploadImg = useUploadVariantImage(productId)

  const pending = addVariant.isPending || updateVariant.isPending || uploadImg.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateVariant.mutateAsync({
          id: variant.id,
          payload: { price: Number(price), stock: Number(stock), is_available: isAvailable },
        })
        if (imageFile) {
          const fd = new FormData()
          fd.append('image', imageFile)
          await uploadImg.mutateAsync({ variantId: variant.id, formData: fd })
        }
        toast.success(t('admin.variants.variantUpdated'))
      } else {
        if (!optionId) return toast.error(t('admin.variants.selectOption'))
        const newVariant = await addVariant.mutateAsync({
          option_id: Number(optionId),
          price: Number(price),
          stock: Number(stock),
          is_available: isAvailable,
        })
        if (imageFile) {
          const fd = new FormData()
          fd.append('image', imageFile)
          await uploadImg.mutateAsync({ variantId: newVariant.id, formData: fd })
        }
        toast.success(t('admin.variants.variantCreated'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.variants.editVariant') : t('admin.variants.addVariant')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isEdit && (
            <>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">{t('admin.variants.variantType')}</Label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => { setSelectedTypeId(Number(e.target.value) || ''); setOptionId('') }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">— {t('admin.variants.variantType')} —</option>
                  {types?.map((vt) => (
                    <option key={vt.id} value={vt.id}>{vt.name_ar}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">{t('admin.variants.option')}</Label>
                <select
                  value={optionId}
                  onChange={(e) => setOptionId(Number(e.target.value) || '')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  disabled={!selectedTypeId}
                >
                  <option value="">— {t('admin.variants.option')} —</option>
                  {options?.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.value_ar}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {isEdit && (
            <p className="text-sm text-muted-foreground">
              {t('admin.variants.option')}: <span className="font-medium text-foreground">{variant.option.value_ar}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">{t('admin.products.price')}</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" required dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">{t('admin.variants.stock')}</Label>
              <Input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0" required dir="ltr" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="var_available"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="size-4"
            />
            <Label htmlFor="var_available">{t('admin.products.available')}</Label>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t('admin.variants.variantImage')}</Label>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => imageRef.current?.click()}>
              <ImagePlus className="size-4" />
              {imageFile ? imageFile.name : t('admin.variants.uploadImage')}
            </Button>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
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

function AddRelatedDialog({
  productId,
  existingIds,
  onClose,
}: {
  productId: string
  existingIds: number[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data: allProducts } = useAdminProducts({ search: search || undefined })
  const addRelated = useAddRelatedProduct(productId)

  const candidates = allProducts?.filter(
    (p) => p.id !== Number(productId) && !existingIds.includes(p.id),
  ) ?? []

  const handleAdd = async (relatedId: number) => {
    try {
      await addRelated.mutateAsync(relatedId)
      toast.success(t('admin.variants.relatedAdded'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl space-y-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('admin.variants.addRelated')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
        </div>
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-2">
          {candidates.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">{t('admin.variants.noProducts')}</p>
          ) : (
            candidates.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAdd(p.id)}
                disabled={addRelated.isPending}
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-start hover:bg-muted/30 transition-colors"
              >
                <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.main_image ? (
                    <img src={resolveMediaUrl(p.main_image) ?? p.main_image} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImagePlus className="size-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{p.name_ar}</p>
                  <Price value={p.price} className="text-xs text-muted-foreground" />
                </div>
                <Plus className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
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
