import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ExternalLink, Image, Loader2, Pencil, Power, Trash2, Video } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAd, useDeleteAdminAd, useToggleAdActive } from '@/features/admin/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import { AdFormDialog } from './AdminAdsPage'

export function AdminAdDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/content') ? '/content' : '/admin'
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: ad, isLoading } = useAdminAd(id)
  const toggle = useToggleAdActive(id ?? '')
  const deleteAd = useDeleteAdminAd()

  const isRtl = i18n.language.startsWith('ar')
  const BackIcon = isRtl ? ArrowRight : ArrowRight

  const fileUrl = resolveMediaUrl(ad?.file ?? '')

  const handleDelete = async () => {
    try {
      await deleteAd.mutateAsync(id!)
      toast.success(t('admin.ads.deleted'))
      navigate(`${basePath}/ads`, { replace: true })
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleToggle = async () => {
    try {
      await toggle.mutateAsync()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={`${basePath}/ads`} className="hover:text-foreground transition-colors">
          {t('admin.ads.title')}
        </Link>
        <span>/</span>
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="text-foreground font-medium truncate max-w-xs">{ad?.title}</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
      ) : !ad ? (
        <p className="text-muted-foreground">{t('errors.generic')}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Media — large preview */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              {ad.media_type === 'video' ? (
                <video
                  src={fileUrl ?? ''}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full object-contain max-h-125"
                />
              ) : fileUrl ? (
                <img
                  src={fileUrl}
                  alt={ad.title}
                  className="w-full object-contain max-h-125"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-muted-foreground">
                  <Image className="size-16" />
                </div>
              )}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{ad.title}</h1>
            </div>

            {/* Status & media type badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${ad.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                <span className={`size-1.5 rounded-full ${ad.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {ad.is_active ? t('admin.ads.active') : t('admin.ads.inactive')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {ad.media_type === 'video' ? <Video className="size-3.5" /> : <Image className="size-3.5" />}
                {ad.media_type === 'video' ? t('admin.ads.video') : t('admin.ads.image')}
              </span>
            </div>

            {/* Info rows */}
            <div className="rounded-xl border border-border divide-y divide-border">
              <InfoRow label={t('admin.ads.orderLabel')} value={String(ad.order)} />
              {ad.link && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{t('admin.ads.linkLabel')}</span>
                  <a
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {t('admin.ads.linkLabel')}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowEdit(true)} className="w-full">
                <Pencil className="size-4" />
                {t('admin.ads.editTitle')}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={toggle.isPending}
                onClick={handleToggle}
              >
                {toggle.isPending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
                {ad.is_active ? t('admin.ads.deactivate') : t('admin.ads.activate')}
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {showEdit && ad && (
        <AdFormDialog ad={ad} onClose={() => setShowEdit(false)} />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{t('admin.ads.confirmDelete')}</h2>
                <p className="text-sm text-muted-foreground">{ad?.title}</p>
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
              <Button variant="outline" disabled={deleteAd.isPending} onClick={() => setConfirmDelete(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium" dir="ltr">{value}</span>
    </div>
  )
}
