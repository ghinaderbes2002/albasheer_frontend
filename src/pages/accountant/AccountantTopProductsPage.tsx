import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccountantTopProducts } from '@/features/accountant/queries'
import {
  EmptyState,
  RankBadge,
  TableSkeleton,
} from '@/pages/accountant/reportBits'

export function AccountantTopProductsPage() {
  const { t } = useTranslation()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 8) + '01'

  const [dateFrom, setDateFrom] = useState(monthStart)
  const [dateTo, setDateTo] = useState(today)
  const [limit, setLimit] = useState('10')
  const [applied, setApplied] = useState({ from: monthStart, to: today, limit: 10 })

  const { data, isLoading } = useAccountantTopProducts({
    date_from: applied.from,
    date_to: applied.to,
    limit: applied.limit,
  })

  const currency = t('common.currency')
  const fmt = (v: string | number | null | undefined) => {
    const n = Number(v)
    return Number.isNaN(n) ? '0' : n.toLocaleString('en-US')
  }

  const apply = () => {
    const parsed = parseInt(limit, 10)
    setApplied({
      from: dateFrom,
      to: dateTo,
      limit: Number.isNaN(parsed) || parsed <= 0 ? 10 : parsed,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('accountant.nav.topProducts')}</h1>
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
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">{t('accountant.reports.limit')}</Label>
          <Input
            type="number"
            min={1}
            dir="ltr"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-24"
          />
        </div>
        <Button onClick={apply} className="self-end">{t('admin.reports.apply')}</Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : !data?.length ? (
        <EmptyState message={t('admin.reports.empty')} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.rank')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.product')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.totalSold')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((p, i) => (
                <tr key={p.product_id ?? i} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-2.5"><RankBadge rank={i + 1} /></td>
                  <td className="px-4 py-2.5 font-medium">{p.name_ar || '—'}</td>
                  <td className="px-4 py-2.5">{p.total_sold}</td>
                  <td className="px-4 py-2.5 tabular-nums"><span dir="ltr">{fmt(p.total_revenue)} {currency}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
