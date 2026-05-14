import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAdminOrders, useCancelAdminOrder } from '@/features/admin/queries'
import { extractApiError } from '@/lib/api'
import type { AdminOrder, OrderStatus } from '@/types/api'

const STATUS_FILTERS: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '', label: 'all' },
  { value: 'pending', label: 'pending' },
  { value: 'confirmed', label: 'confirmed' },
  { value: 'preparing', label: 'preparing' },
  { value: 'shipping', label: 'shipping' },
  { value: 'delivered', label: 'delivered' },
  { value: 'cancelled', label: 'cancelled' },
]

export function AdminOrdersPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [cancelOrder, setCancelOrder] = useState<AdminOrder | null>(null)

  const { data, isLoading } = useAdminOrders({
    status: statusFilter || undefined,
    search: search || undefined,
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.orders.title')}</h1>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          className="w-full sm:w-64"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value ? t(`status.${s.value}`) : t('common.all')}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={statusFilter ? t('admin.orders.emptyForFilter') : t('admin.orders.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.orders.customer')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.orders.branch')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('orders.total')}</th>
                <th className="px-4 py-3 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer_name || t('dashboard.branch.unnamedCustomer')}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{o.branch_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>
                      {t(`status.${o.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" dir="ltr">
                    {Number(o.total_price).toLocaleString()} {t('common.currency')}
                  </td>
                  <td className="px-4 py-3">
                    {(o.status === 'pending' || o.status === 'confirmed') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setCancelOrder(o)}
                      >
                        {t('orders.cancel.button')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelOrder && (
        <CancelDialog
          order={cancelOrder}
          onClose={() => setCancelOrder(null)}
        />
      )}
    </div>
  )
}

function CancelDialog({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const { t } = useTranslation()
  const [note, setNote] = useState('')
  const cancel = useCancelAdminOrder(order.id)

  const handleSubmit = async () => {
    try {
      await cancel.mutateAsync(note || undefined)
      toast.success(t('admin.orders.cancelled'))
      onClose()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-semibold">{t('admin.orders.cancelOrder')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('orders.orderNumber', { id: order.id })} — {order.customer_name}
        </p>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">{t('admin.orders.cancelNote')}</Label>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleSubmit}
            disabled={cancel.isPending}
          >
            {cancel.isPending && <Loader2 className="animate-spin size-4" />}
            {t('orders.cancel.yes')}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={cancel.isPending}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function statusColor(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    shipping: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[status]
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Inbox className="size-10" />
      <p>{message}</p>
    </div>
  )
}
