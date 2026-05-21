import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { ExternalLink, Image, Inbox, Loader2, Pencil, Plus, Power, Search, Trash2, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminAds,
  useCreateAdminAd,
  useDeleteAdminAd,
  useToggleAdActive,
  useUpdateAdminAd,
} from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import type { AdminAd } from '@/types/api'

export function AdminAdsPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const [editAd, setEditAd] = useState<AdminAd | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<AdminAd | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useAdminAds()
  const deleteAd = useDeleteAdminAd()

  const filtered = search.trim()
    ? (data ?? []).filter((ad) => ad.title.toLowerCase().includes(search.toLowerCase()))
    : (data ?? [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await deleteAd.mutateAsync(confirmDelete.id)
      toast.success(t('admin.ads.deleted'))
      setConfirmDelete(null)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('admin.ads.title')}</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('admin.ads.add')}
        </Button>
      </header>

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <Inbox className="size-10" />
          <p>{t('admin.ads.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              basePath={basePath}
              onEdit={() => setEditAd(ad)}
              onDelete={() => setConfirmDelete(ad)}
            />
          ))}
        </div>
      )}

      {(showCreate || editAd) && (
        <AdFormDialog
          ad={editAd}
          onClose={() => { setShowCreate(false); setEditAd(null) }}
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
                <h2 className="text-base font-semibold">{t('admin.ads.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{confirmDelete.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteAd.isPending}
                onClick={handleDelete}
              >
                {deleteAd.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button variant="outline" disabled={deleteAd.isPending} onClick={() => setConfirmDelete(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdCard({ ad, basePath, onEdit, onDelete }: { ad: AdminAd; basePath: string; onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation()
  const toggle = useToggleAdActive(ad.id)
  const fileUrl = resolveMediaUrl(ad.file)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Clickable media area → detail page */}
      <Link to={`${basePath}/ads/${ad.id}`} className="block">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {ad.media_type === 'video' ? (
          <video
            src={fileUrl ?? ''}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : fileUrl ? (
          <img src={fileUrl} alt={ad.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Image className="size-10" />
          </div>
        )}
        {/* Media type badge */}
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {ad.media_type === 'video' ? <Video className="size-3" /> : <Image className="size-3" />}
          {ad.media_type}
        </span>
        {/* Active badge */}
        <span className={`absolute end-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${ad.is_active ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/80 text-white'}`}>
          {ad.is_active ? t('admin.ads.active') : t('admin.ads.inactive')}
        </span>
      </div>
      </Link>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">{ad.title}</p>
            <p className="text-xs text-muted-foreground">{t('admin.ads.orderLabel')}: {ad.order}</p>
          </div>
          {ad.link && (
            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={toggle.isPending}
            onClick={() => toggle.mutate()}
          >
            {toggle.isPending ? <Loader2 className="size-3 animate-spin" /> : <Power className="size-3" />}
            {ad.is_active ? t('admin.ads.deactivate') : t('admin.ads.activate')}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface AdFormValues {
  title: string
  media_type: 'image' | 'video'
  link: string
  is_active: boolean
  order: number
  file: FileList
}

export function AdFormDialog({ ad, onClose }: { ad: AdminAd | null; onClose: () => void }) {
  const { t } = useTranslation()
  const isEdit = !!ad
  const create = useCreateAdminAd()
  const update = useUpdateAdminAd(ad?.id ?? 0)

  const { register, handleSubmit } = useForm<AdFormValues>({
    defaultValues: {
      title: ad?.title ?? '',
      media_type: ad?.media_type ?? 'image',
      link: ad?.link ?? '',
      is_active: ad?.is_active ?? true,
      order: ad?.order ?? 0,
    },
  })

  const onSubmit = async (values: AdFormValues) => {
    try {
      const hasNewFile = !!values.file?.[0]
      if (isEdit) {
        if (hasNewFile) {
          const fd = new FormData()
          fd.append('title', values.title)
          fd.append('media_type', values.media_type)
          fd.append('link', values.link)
          fd.append('is_active', String(values.is_active))
          fd.append('order', String(values.order))
          fd.append('file', values.file[0])
          await update.mutateAsync(fd)
        } else {
          await update.mutateAsync({
            title: values.title,
            media_type: values.media_type,
            link: values.link,
            is_active: values.is_active,
            order: values.order,
          })
        }
        toast.success(t('admin.ads.updated'))
      } else {
        const fd = new FormData()
        fd.append('title', values.title)
        fd.append('media_type', values.media_type)
        fd.append('link', values.link)
        fd.append('is_active', String(values.is_active))
        fd.append('order', String(values.order))
        if (hasNewFile) fd.append('file', values.file[0])
        await create.mutateAsync(fd)
        toast.success(t('admin.ads.created'))
      }
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold">
          {isEdit ? t('admin.ads.editTitle') : t('admin.ads.addTitle')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label={t('admin.ads.titleLabel')}>
            <Input {...register('title')} required />
          </Field>

          <Field label={t('admin.ads.mediaType')}>
            <select
              {...register('media_type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="image">{t('admin.ads.image')}</option>
              <option value="video">{t('admin.ads.video')}</option>
            </select>
          </Field>

          <Field label={isEdit ? t('admin.ads.replaceFile') : t('admin.ads.fileLabel')}>
            {isEdit && ad?.file && (
              <div className="mb-1.5 overflow-hidden rounded-lg border border-border bg-muted">
                {ad.media_type === 'video' ? (
                  <video src={resolveMediaUrl(ad.file) ?? ''} className="h-24 w-full object-cover" muted />
                ) : (
                  <img src={resolveMediaUrl(ad.file) ?? ''} alt="" className="h-24 w-full object-cover" />
                )}
              </div>
            )}
            <Input {...register('file')} type="file" accept="image/*,video/*" required={!isEdit} />
          </Field>

          <Field label={t('admin.ads.linkLabel')}>
            <Input {...register('link')} type="url" placeholder="https://..." dir="ltr" />
          </Field>

          <Field label={t('admin.ads.orderLabel')}>
            <Input {...register('order', { valueAsNumber: true })} type="number" min={0} dir="ltr" />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} className="size-4" />
            {t('admin.ads.active')}
          </label>

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
