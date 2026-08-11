import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Package, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccountantSalesReport } from '@/features/accountant/queries'
import {
  EmptyState,
  SummaryCard,
  TableSkeleton,
} from '@/pages/accountant/reportBits'

export function AccountantSalesReportPage() {
  const { t } = useTranslation()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 8) + '01'

  const [dateFrom, setDateFrom] = useState(monthStart)
  const [dateTo, setDateTo] = useState(today)
  const [applied, setApplied] = useState({ from: monthStart, to: today })

  const { data, isLoading } = useAccountantSalesReport({
    date_from: applied.from,
    date_to: applied.to,
  })

  const currency = t('common.currency')
  const fmt = (v: string | number | null | undefined) => {
    const n = Number(v)
    return Number.isNaN(n) ? '0' : n.toLocaleString('en-US')
  }

  const rows = data?.daily_breakdown ?? []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('accountant.nav.sales')}</h1>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateFrom')}</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateTo')}</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
        <Button onClick={() => setApplied({ from: dateFrom, to: dateTo })} className="self-end">
          {t('admin.reports.apply')}
        </Button>
      </div>

      {!isLoading && data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard
            label={t('admin.reports.revenue')}
            value={`${fmt(data.total_revenue)} ${currency}`}
            icon={BarChart3}
            color="text-primary"
            bg="bg-primary/10"
          />
          <SummaryCard
            label={t('admin.reports.ordersCount')}
            value={String(data.total_orders ?? 0)}
            icon={Package}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950"
          />
          <SummaryCard
            label={t('status.delivered')}
            value={String(data.delivered_orders ?? 0)}
            icon={Package}
            color="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-50 dark:bg-emerald-950"
          />
          <SummaryCard
            label={t('status.cancelled')}
            value={String(data.cancelled_orders ?? 0)}
            icon={XCircle}
            color="text-destructive"
            bg="bg-destructive/10"
          />
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : !rows.length ? (
        <EmptyState message={t('admin.reports.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.date')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.ordersCount')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono"><span dir="ltr">{r.date}</span></td>
                  <td className="px-4 py-2.5">{r.orders}</td>
                  <td className="px-4 py-2.5 tabular-nums"><span dir="ltr">{fmt(r.revenue)} {currency}</span></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-muted/30">
              <tr>
                <td className="px-4 py-2.5 font-semibold">{t('admin.reports.total')}</td>
                <td className="px-4 py-2.5 font-semibold">{data?.total_orders ?? 0}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums text-primary">
                  <span dir="ltr">{fmt(data?.total_revenue)} {currency}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
