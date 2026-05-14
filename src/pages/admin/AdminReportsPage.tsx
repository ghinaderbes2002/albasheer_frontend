import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
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
  const [applied, setApplied] = useState({ from: monthStart, to: today })

  const salesParams = { date_from: applied.from, date_to: applied.to }
  const { data: sales, isLoading: salesLoading } = useSalesReport(salesParams)
  const { data: topProducts, isLoading: topProdLoading } = useTopProductsReport(salesParams)
  const { data: topBranches, isLoading: topBranchLoading } = useTopBranchesReport(salesParams)

  const apply = () => setApplied({ from: dateFrom, to: dateTo })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header>
        <h1 className="text-2xl font-bold">{t('admin.reports.title')}</h1>
      </header>

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateFrom')}</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">{t('admin.reports.dateTo')}</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={apply}>{t('admin.reports.apply')}</Button>
      </div>

      {/* Sales */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.reports.salesTitle')}</h2>
        {salesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : !sales?.length ? (
          <p className="text-sm text-muted-foreground">{t('admin.reports.empty')}</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.ordersCount')}</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2" dir="ltr">{s.date}</td>
                    <td className="px-4 py-2">{s.orders_count}</td>
                    <td className="px-4 py-2" dir="ltr">{Number(s.revenue).toLocaleString()} {t('common.currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top products */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('admin.reports.topProductsTitle')}</h2>
        {topProdLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : !topProducts?.length ? (
          <p className="text-sm text-muted-foreground">{t('admin.reports.empty')}</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.totalSold')}</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{p.product_name}</td>
                    <td className="px-4 py-2">{p.total_sold}</td>
                    <td className="px-4 py-2" dir="ltr">{Number(p.revenue).toLocaleString()} {t('common.currency')}</td>
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
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : !topBranches?.length ? (
          <p className="text-sm text-muted-foreground">{t('admin.reports.empty')}</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">Branch</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.ordersCount')}</th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topBranches.map((b, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{b.branch_name}</td>
                    <td className="px-4 py-2">{b.total_orders}</td>
                    <td className="px-4 py-2" dir="ltr">{Number(b.revenue).toLocaleString()} {t('common.currency')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
