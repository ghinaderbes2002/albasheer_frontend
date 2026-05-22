import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminBranches, useAdminOrders } from '@/features/admin/queries'
import type { OrderStatus } from '@/types/api'

const STATUSES: Array<OrderStatus | ''> = ['', 'pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [branchFilter, setBranchFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: branches } = useAdminBranches()
  const { data, isLoading } = useAdminOrders({
    status: statusFilter || undefined,
    branch: branchFilter || undefined,
    search: search || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.orders.title')}</h1>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="w-full sm:w-56">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? t(`status.${s}`) : t('common.all')}
            </option>
          ))}
        </select>

        {branches && branches.length > 0 && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t('admin.reports.allBranches')}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name_ar || b.name}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
            max={today}
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
            max={today}
          />
        </div>

        {(search || statusFilter || branchFilter || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setStatusFilter(''); setBranchFilter(''); setDateFrom(''); setDateTo('') }}
          >
            {t('common.reset')}
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState message={t('admin.orders.empty')} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.orders.number')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.orders.customer')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.orders.branch')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.orders.status')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.orders.total')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden lg:table-cell">{t('admin.orders.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono" dir="ltr">#{o.id}</td>
                  <td className="px-4 py-3 font-medium" dir="ltr">{o.customer_phone}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{o.branch_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>
                      {t(`status.${o.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell tabular-nums" dir="ltr">
                    {Number(o.total_price).toLocaleString('en-US')} {t('common.currency')}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground font-mono text-xs" dir="ltr">
                    {o.created_at.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function statusColor(status: OrderStatus) {
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
