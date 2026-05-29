import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Package, Building2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminBranches,
  useSalesReport,
  useTopBranchesReport,
  useTopProductsReport,
} from '@/features/admin/queries'

export function AdminReportsPage() {
  const { t } = useTranslation()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 8) + '01'

  const [dateFrom, setDateFrom] = useState(monthStart)
  const [dateTo, setDateTo] = useState(today)
  const [branch, setBranch] = useState('')
  const [applied, setApplied] = useState({ from: monthStart, to: today, branch: '' })

  const { data: branches } = useAdminBranches()

  const salesParams = {
    date_from: applied.from,
    date_to: applied.to,
    branch: applied.branch || undefined,
  }
  const { data: sales, isLoading: salesLoading } = useSalesReport(salesParams)
  const { data: topProducts, isLoading: topProdLoading } = useTopProductsReport(salesParams)
  const { data: topBranches, isLoading: topBranchLoading } = useTopBranchesReport(salesParams)

  const currency = t('common.currency')
  const fmt = (v: string | number | null | undefined) => {
    const n = Number(v)
    return isNaN(n) ? '0' : n.toLocaleString('en-US')
  }

  const totalRevenue = sales?.total_revenue ?? 0
  const totalOrders = sales?.total_orders ?? 0
  const dailyRows = sales?.daily_breakdown ?? []

  const apply = () => setApplied({ from: dateFrom, to: dateTo, branch })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.reports.title')}</h1>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateFrom')}</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateTo')}</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
        {branches && branches.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">{t('admin.reports.branch')}</Label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('admin.reports.allBranches')}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name_ar || b.name}</option>
              ))}
            </select>
          </div>
        )}
        <Button onClick={apply} className="self-end">{t('admin.reports.apply')}</Button>
      </div>

      {/* Summary cards */}
      {!salesLoading && (sales?.total_orders ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SummaryCard
            label={t('admin.reports.revenue')}
            value={`${fmt(totalRevenue)} ${currency}`}
            icon={BarChart3}
            color="text-primary"
            bg="bg-primary/10"
          />
          <SummaryCard
            label={t('admin.reports.ordersCount')}
            value={String(totalOrders)}
            icon={Package}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950"
          />
          <SummaryCard
            label={t('admin.reports.topBranchesTitle')}
            value={topBranches?.[0]?.name_ar ?? '—'}
            icon={Building2}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950"
          />
        </div>
      )}

      {/* Sales table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.reports.salesTitle')}</h2>
        {salesLoading ? (
          <TableSkeleton rows={5} cols={3} />
        ) : !dailyRows.length ? (
          <EmptyState message={t('admin.reports.empty')} />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.date')}</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.ordersCount')}</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailyRows.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-sm"><span dir="ltr">{s.date}</span></td>
                    <td className="px-4 py-2.5">{s.orders}</td>
                    <td className="px-4 py-2.5 tabular-nums"><span dir="ltr">{fmt(s.revenue)} {currency}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 border-t-2 border-border">
                <tr>
                  <td className="px-4 py-2.5 font-semibold">{t('admin.reports.total')}</td>
                  <td className="px-4 py-2.5 font-semibold">{totalOrders}</td>
                  <td className="px-4 py-2.5 font-semibold tabular-nums text-primary"><span dir="ltr">{fmt(totalRevenue)} {currency}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Top products + Top branches — side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t('admin.reports.topProductsTitle')}</h2>
          {topProdLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : !topProducts?.length ? (
            <EmptyState message={t('admin.reports.empty')} />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground w-10">{t('admin.reports.rank')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.product')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.totalSold')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-4 py-2.5 font-medium">{p.name_ar || '—'}</td>
                      <td className="px-4 py-2.5">{p.total_sold}</td>
                      <td className="px-4 py-2.5 tabular-nums"><span dir="ltr">{fmt(p.total_revenue)} {currency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Top branches */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t('admin.reports.topBranchesTitle')}</h2>
          {topBranchLoading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : !topBranches?.length ? (
            <EmptyState message={t('admin.reports.empty')} />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground w-10">{t('admin.reports.rank')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.branchName')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.ordersCount')}</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topBranches.map((b, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-4 py-2.5 font-medium">{b.name_ar || '—'}</td>
                      <td className="px-4 py-2.5">{b.total_orders}</td>
                      <td className="px-4 py-2.5 tabular-nums"><span dir="ltr">{fmt(b.total_revenue)} {currency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function SummaryCard({
  label, value, icon: Icon, color, bg,
}: {
  label: string; value: string; icon: React.ElementType; color: string; bg: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`flex size-9 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </div>
      <p className="text-xl font-bold leading-tight" dir="ltr">{value}</p>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    2: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    3: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  }
  const cls = colors[rank] ?? 'text-muted-foreground'
  return (
    <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-bold ${cls}`}>
      {rank}
    </span>
  )
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-2.5 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </p>
  )
}
