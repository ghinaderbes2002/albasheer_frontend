import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMinFreeDelivery,
  useSetMinFreeDelivery,
} from '@/features/branchDashboard/queries'
import { extractApiError } from '@/lib/api'

/**
 * Branch-manager settings. Currently just the free-delivery threshold —
 * `min_free_delivery_amount` on the manager's own branch.
 */
export function BranchSettingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useMinFreeDelivery()
  const save = useSetMinFreeDelivery()

  // `null` means "untouched" — show whatever the server has. Editing takes
  // over; saving hands control back so the response becomes the new baseline.
  const [draft, setDraft] = useState<string | null>(null)
  const amount = draft ?? data?.min_free_delivery_amount ?? ''

  const trimmed = amount.trim()
  const parsed = parseFloat(trimmed)
  const valid = trimmed === '' || (!Number.isNaN(parsed) && parsed >= 0)

  const submit = async () => {
    try {
      // An empty field clears the threshold — the backend field is nullable
      // and a null means "this branch has no free-delivery offer".
      await save.mutateAsync(trimmed === '' ? null : trimmed)
      setDraft(null)
      toast.success(t('dashboard.branch.freeDelivery.saved'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
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

      <div className="max-w-md space-y-3 rounded-2xl border border-border bg-card p-5">
        <Label htmlFor="min_free_delivery_amount">
          <Truck className="size-3.5 text-primary" />
          {t('dashboard.branch.freeDelivery.label')}
        </Label>

        {isLoading ? (
          <Skeleton className="h-10 w-full rounded-md" />
        ) : (
          <Input
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
          />
        )}

        <p className="text-xs text-muted-foreground">
          {t('dashboard.branch.freeDelivery.hint')}
        </p>

        <Button
          type="button"
          disabled={!valid || isLoading || save.isPending}
          onClick={submit}
        >
          {save.isPending ? <Loader2 className="animate-spin" /> : <Check />}
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
