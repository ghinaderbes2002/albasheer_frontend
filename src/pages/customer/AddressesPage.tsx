import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from '@/features/addresses/queries'
import { useCities } from '@/features/branches/queries'
import { extractApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Address, AddressPayload } from '@/types/api'

export function AddressesPage() {
  const { t } = useTranslation()
  const { data: addresses, isLoading } = useAddresses()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {t('addresses.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('addresses.subtitle')}
          </p>
        </div>
        {!adding && editingId === null && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            {t('addresses.add')}
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <AddressForm
            onCancel={() => setAdding(false)}
            onDone={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <MapPin className="size-10" />
          <p>{t('addresses.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) =>
            editingId === addr.id ? (
              <AddressForm
                key={addr.id}
                address={addr}
                onCancel={() => setEditingId(null)}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setEditingId(addr.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
}: {
  address: Address
  onEdit: () => void
}) {
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const setDefault = useSetDefaultAddress()
  const del = useDeleteAddress()

  const handleDelete = async () => {
    try {
      await del.mutateAsync(address.id)
      toast.success(t('addresses.deleted'))
      setDeleteOpen(false)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const handleSetDefault = async () => {
    try {
      await setDefault.mutateAsync(address.id)
      toast.success(t('addresses.setDefaultSuccess'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <>
      <Card className={cn(address.is_default && 'border-primary/40 bg-primary/5')}>
        <CardContent className="flex items-start justify-between gap-3 pt-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{address.label}</span>
              {address.is_default && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Star className="size-2.5" />
                  {t('addresses.default')}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{address.city}</p>
            <p className="text-sm text-foreground/80">{address.full_address}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!address.is_default && (
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-amber-500"
                disabled={setDefault.isPending}
                onClick={handleSetDefault}
                title={t('addresses.setDefault')}
              >
                {setDefault.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Star className="size-4" />
                )}
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-muted-foreground"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-destructive/70 hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4">
            <h2 className="text-base font-semibold">{t('addresses.deleteTitle')}</h2>
            <p className="text-sm text-muted-foreground">{address.label} — {address.full_address}</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                disabled={del.isPending}
                onClick={handleDelete}
              >
                {del.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t('common.delete')}
              </Button>
              <Button
                variant="outline"
                disabled={del.isPending}
                onClick={() => setDeleteOpen(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Address Form (create + edit) ─────────────────────────────────────────────

function AddressForm({
  address,
  onCancel,
  onDone,
}: {
  address?: Address
  onCancel: () => void
  onDone: () => void
}) {
  const { t } = useTranslation()
  const { data: cities } = useCities()
  const create = useCreateAddress()
  const update = useUpdateAddress(address?.id ?? 0)

  const [form, setForm] = useState<AddressPayload>({
    label: address?.label ?? '',
    city: address?.city ?? '',
    full_address: address?.full_address ?? '',
  })

  const busy = create.isPending || update.isPending

  const set = (field: keyof AddressPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed: AddressPayload = {
      label: form.label.trim(),
      city: form.city.trim(),
      full_address: form.full_address.trim(),
    }
    if (!trimmed.label || !trimmed.city || !trimmed.full_address) return
    try {
      if (address) {
        await update.mutateAsync(trimmed)
        toast.success(t('addresses.updated'))
      } else {
        await create.mutateAsync(trimmed)
        toast.success(t('addresses.created'))
      }
      onDone()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-base">
          {address ? t('addresses.editTitle') : t('addresses.addTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-label">{t('addresses.form.label')}</Label>
              <Input
                id="addr-label"
                placeholder={t('addresses.form.labelPlaceholder')}
                value={form.label}
                onChange={set('label')}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-city">{t('addresses.form.city')}</Label>
              <select
                id="addr-city"
                value={form.city}
                onChange={set('city')}
                disabled={busy}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{t('addresses.form.cityPlaceholder')}</option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-full">{t('addresses.form.fullAddress')}</Label>
            <Input
              id="addr-full"
              placeholder={t('addresses.form.fullAddressPlaceholder')}
              value={form.full_address}
              onChange={set('full_address')}
              disabled={busy}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={busy || !form.label || !form.city || !form.full_address}
            >
              {busy && <Loader2 className="animate-spin" />}
              {t('common.save')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
