import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Loader2, Save, Truck, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { FreeDeliveryNote } from '@/features/cart/FreeDeliveryNote'
import {
  useMinFreeDelivery,
  useSetMinFreeDelivery,
} from '@/features/branchDashboard/queries'
import { extractApiError } from '@/lib/api'
import { formatPrice } from '@/lib/format'

/**
 * Branch-manager settings. Currently just the free-delivery threshold —
 * `min_free_delivery_amount` on the manager's own branch.
 */
export function BranchSettingsPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useMinFreeDelivery()
  const save = useSetMinFreeDelivery()

  // `null` means "untouched" — show whatever the server has. Editing takes
  // over; saving hands control back so the response becomes the new baseline.
  const [draft, setDraft] = useState<string | null>(null)
  const saved = data?.min_free_delivery_amount ?? ''
  const amount = draft ?? saved

  const trimmed = amount.trim()
  const parsed = parseFloat(trimmed)
  const valid = trimmed === '' || (!Number.isNaN(parsed) && parsed >= 0)
  const dirty = trimmed !== saved.trim()

  const savedAmount = parseFloat(saved)
  const isActive = saved !== '' && !Number.isNaN(savedAmount) && savedAmount > 0

  const persist = async (value: string | null, message: string) => {
    try {
      await save.mutateAsync(value)
      setDraft(null)
      toast.success(message)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || !dirty) return
    // An empty field clears the threshold — the backend field is nullable
    // and a null means "this branch has no free-delivery offer".
    persist(
      trimmed === '' ? null : trimmed,
      trimmed === ''
        ? t('dashboard.branch.freeDelivery.cleared')
        : t('dashboard.branch.freeDelivery.saved'),
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('dashboard.branch.settings.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.branch.settings.subtitle')}
        </p>
      </header>

      <div className="max-w-xl">
        {isLoading ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Card header — icon, title, and the live on/off state */}
            <div className="flex items-start gap-3 border-b border-border bg-muted/30 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Truck className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="font-semibold leading-tight">
                  {t('dashboard.branch.freeDelivery.cardTitle')}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('dashboard.branch.freeDelivery.cardSubtitle')}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isActive
                  ? t('dashboard.branch.freeDelivery.active')
                  : t('dashboard.branch.freeDelivery.inactive')}
              </span>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-1.5">
                <Label htmlFor="min_free_delivery_amount" className="text-sm font-medium">
                  {t('dashboard.branch.freeDelivery.label')}
                </Label>

                {/* Currency-prefixed field, mirroring the admin settings form */}
                <div
                  dir="ltr"
                  className="flex h-11 overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring"
                >
                  <span className="flex select-none items-center border-r border-input bg-muted px-3.5 text-sm font-semibold text-muted-foreground">
                    {t('common.currency')}
                  </span>
                  <input
                    id="min_free_delivery_amount"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    dir="ltr"
                    placeholder={t('dashboard.branch.freeDelivery.placeholder')}
                    value={amount}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={save.isPending}
                    className="flex-1 bg-transparent px-3 text-base font-medium tabular-nums outline-none disabled:opacity-50"
                  />
                </div>

                <p className="pt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t('dashboard.branch.freeDelivery.hint')}
                </p>
              </div>

              {/* What the customer actually sees at checkout */}
              {valid && trimmed !== '' && parsed > 0 && (
                <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/20 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Eye className="size-3.5" />
                    {t('dashboard.branch.freeDelivery.previewLabel')}
                  </p>
                  <FreeDeliveryNote
                    city={{
                      id: 0,
                      name: '',
                      requires_deposit: false,
                      min_free_delivery_amount: trimmed,
                    }}
                    subtotal={0}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Button type="submit" disabled={!valid || !dirty || save.isPending}>
                  {save.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {t('common.save')}
                </Button>

                {isActive && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={save.isPending}
                    onClick={() =>
                      persist(null, t('dashboard.branch.freeDelivery.cleared'))
                    }
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-4" />
                    {t('dashboard.branch.freeDelivery.clear')}
                  </Button>
                )}

                {isActive && !dirty && (
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.branch.freeDelivery.current', {
                      amount: formatPrice(savedAmount, i18n.language),
                    })}
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
