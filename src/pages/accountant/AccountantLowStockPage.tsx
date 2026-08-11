import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PackageCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Price } from '@/components/shared/Price'
import { useAccountantLowStock } from '@/features/accountant/queries'
import { LOW_STOCK_THRESHOLD, stockBadgeClass, stockLevel } from '@/lib/stock'
import { TableSkeleton } from '@/pages/accountant/reportBits'

export function AccountantLowStockPage() {
  const { t } = useTranslation()
  const [threshold, setThreshold] = useState(String(LOW_STOCK_THRESHOLD))
  const [applied, setApplied] = useState(LOW_STOCK_THRESHOLD)

  const { data, isLoading } = useAccountantLowStock(applied)

  const apply = () => {
    const parsed = parseInt(threshold, 10)
    setApplied(Number.isNaN(parsed) || parsed < 0 ? LOW_STOCK_THRESHOLD : parsed)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t('accountant.nav.lowStock')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('accountant.reports.lowStockSubtitle')}
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-sm text-muted-foreground">
            {t('accountant.reports.threshold')}
          </Label>
          <Input
            type="number"
            min={0}
            dir="ltr"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-28"
          />
        </div>
        <Button onClick={apply} className="self-end">{t('admin.reports.apply')}</Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={3} />
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <PackageCheck className="size-10 text-emerald-600" />
          <p>{t('accountant.reports.lowStockEmpty')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.reports.product')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.products.category')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.price')}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.inStock')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{p.name_ar || p.name || '—'}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">
                    {p.category_name ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {p.price ? <Price value={p.price} /> : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${stockBadgeClass[stockLevel(p.stock_quantity)]}`}
                    >
                      {p.stock_quantity > 0
                        ? p.stock_quantity
                        : t('admin.products.outOfStock')}
                    </span>
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
