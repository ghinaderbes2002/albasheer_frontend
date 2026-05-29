import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { ImagePlus, Inbox, Loader2, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminCategories,
  useAdminProduct,
  useAdminProducts,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useDeleteProductImage,
  useUpdateAdminProduct,
  useUploadProductImages,
} from '@/features/admin/queries'
import { uploadProductImages } from '@/api/admin'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import type { AdminProduct } from '@/types/api'

export function AdminProductsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null)

  const { data: categories } = useAdminCategories()
  const { data: rawData, isLoading } = useAdminProducts({
    search: search || undefined,
  })
  const data = categoryFilter
    ? (rawData ?? []).filter((p) => String(p.category) === categoryFilter)
    : (rawData ?? [])
  const deleteProduct = useDeleteAdminProduct()

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteProduct.mutateAsync(confirmDelete.id)
      toast.success(t('admin.products.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.products.title')}</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute inset-y-0 inset-e-3 my-auto size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pe-9"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
        <Button onClick={() => setShowCreate(true)} className="ms-auto">
          <Plus className="size-4" />
          {t('admin.products.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data.length ? (
        <EmptyState message={categoryFilter ? t('catalog.empty') : t('admin.products.empty')} />
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
                <tr
                  key={p.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`${basePath}/products/${p.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.main_image
                        ? <img src={resolveMediaUrl(p.main_image) ?? p.main_image} alt="" className="size-8 rounded object-cover shrink-0" />
                        : <div className="size-8 rounded bg-muted shrink-0" />
                      }
                      <div>
                        <p className="font-medium">{p.name_ar}</p>
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span dir="ltr">{Number(p.price).toLocaleString('en-US')} {t('common.currency')}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {p.category_name ?? p.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_available ? t('admin.products.available') : t('catalog.outOfStock')}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditProduct(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete(p)}
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

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t('admin.products.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.name_ar}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteProduct.isPending}
                onClick={handleDelete}
              >
                {deleteProduct.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button variant="outline" disabled={deleteProduct.isPending} onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// exported so AdminProductDetailPage can reuse it for editing
export function ProductFormDialog({
  product: initialProduct,
  onClose,
}: {
  product: AdminProduct | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const { data: categories } = useAdminCategories()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const isEdit = !!initialProduct

  // In edit mode fetch the full product to get current images
  const { data: fullProduct } = useAdminProduct(isEdit ? initialProduct!.id : undefined)
  const currentImages = fullProduct?.images ?? initialProduct?.images ?? []

  const uploadImages = useUploadProductImages(initialProduct?.id ?? 0)
  const deleteImage = useDeleteProductImage(initialProduct?.id ?? 0)

  const create = useCreateAdminProduct()
  const update = useUpdateAdminProduct(initialProduct?.id ?? 0)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: initialProduct?.name ?? '',
      name_ar: initialProduct?.name_ar ?? '',
      description: initialProduct?.description ?? '',
      description_ar: initialProduct?.description_ar ?? '',
      price: initialProduct?.price ?? '',
      category: initialProduct?.category ?? 0,
      is_available: initialProduct?.is_available ?? true,
      is_featured: initialProduct?.is_featured ?? false,
    },
  })

  const addFiles = (files: FileList) => {
    const arr = Array.from(files)
    setPendingFiles((prev) => [...prev, ...arr])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUploadNewImages = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('image', file)
      await uploadImages.mutateAsync(fd)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteImage.mutateAsync(imageId)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

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
          is_available: values.is_available,
          is_featured: values.is_featured,
        })
        toast.success(t('admin.products.updated'))
        onClose()
      } else {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)))
        const newProduct = await create.mutateAsync(fd)
        toast.success(t('admin.products.created'))

        if (pendingFiles.length > 0) {
          setUploading(true)
          for (const file of pendingFiles) {
            const imgFd = new FormData()
            imgFd.append('image', file)
            await uploadProductImages(newProduct.id, imgFd)
          }
          setUploading(false)
        }

        navigate(`${basePath}/products/${newProduct.id}`)
      }
    } catch (err) {
      setUploading(false)
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending || uploading

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
            {isEdit && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('is_available')} className="size-4" />
                {t('admin.products.available')}
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_featured')} className="size-4" />
              {t('admin.products.featured')}
            </label>
          </div>

          {/* Images section */}
          <Field label={t('admin.products.images')}>
            {/* Existing images (edit mode) */}
            {isEdit && currentImages.length > 0 && (
              <div className="mb-2 grid grid-cols-4 gap-2">
                {currentImages.map((img) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={resolveMediaUrl(img.image) ?? img.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {img.is_main && (
                      <span className="absolute inset-s-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary">
                        <Star className="size-2.5 text-primary-foreground" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deleteImage.isPending}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {deleteImage.isPending
                        ? <Loader2 className="size-4 text-white animate-spin" />
                        : <Trash2 className="size-4 text-white" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadImages.isPending
                ? <Loader2 className="size-5 animate-spin" />
                : <ImagePlus className="size-6" />
              }
              <span>{t('admin.products.addImage')}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (!e.target.files?.length) return
                if (isEdit) {
                  handleUploadNewImages(e.target.files)
                } else {
                  addFiles(e.target.files)
                }
              }}
            />

            {/* Pending files preview (create mode) */}
            {!isEdit && pendingFiles.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div className="flex gap-2 pt-1 flex-wrap">
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
