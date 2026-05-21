import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Loader2, Save, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useSiteSettings, useUpdateSiteSettings } from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { SiteSettings } from '@/types/api'

export function AdminSettingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useSiteSettings()
  const update = useUpdateSiteSettings()

  const { register, handleSubmit, reset } = useForm<SiteSettings>()

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const onSubmit = async (values: SiteSettings) => {
    try {
      await update.mutateAsync(values)
      toast.success(t('admin.settings.saved'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </header>

      <div className="max-w-lg">
        {isLoading ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-1">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <Settings className="size-4 text-primary" />
              </div>
              <span className="font-semibold">{t('admin.settings.general')}</span>
            </div>

            <Field label={t('admin.settings.siteName')}>
              <Input {...register('site_name')} required />
            </Field>

            <Field label={t('admin.settings.contactPhone')}>
              <div dir="ltr" className="flex h-10 overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
                <span className="flex items-center border-r border-input bg-muted px-3 text-sm font-medium select-none">+</span>
                <input
                  {...register('contact_phone')}
                  dir="ltr"
                  placeholder="963XXXXXXXXX"
                  className="flex-1 bg-transparent px-3 text-sm outline-none"
                />
              </div>
            </Field>

            <Field label={t('admin.settings.depositPercent')}>
              <div dir="ltr" className="flex h-10 overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
                <input
                  {...register('min_deposit_percent', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={100}
                  dir="ltr"
                  className="flex-1 bg-transparent px-3 text-sm outline-none"
                />
                <span className="flex items-center border-l border-input bg-muted px-3 text-sm font-medium select-none">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('admin.settings.depositHint')}</p>
            </Field>

            <div className="pt-2">
              <Button type="submit" disabled={update.isPending} className="w-full sm:w-auto">
                {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {t('admin.settings.save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}
