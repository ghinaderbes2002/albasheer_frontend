import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminOrder } from '@/features/admin/queries'
import { AdminOrderActions } from '@/features/admin/AdminOrderActions'
import { resolveMediaUrl } from '@/lib/api'
import { statusColor } from './AdminOrdersPage'
import { Price } from '@/components/shared/Price'

export function AdminOrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading } = useAdminOrder(id)

  const currency = t('common.currency')
  const currencySP = t('common.currencySP')
  const fmt = (v: string | number) => Number(v).toLocaleString('en-US')

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!order) return <p className="text-muted-foreground">{t('errors.notFound')}</p>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
          <ChevronRight className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold" dir="ltr">#{order.id}</h1>
      </div>

      {/* Actions */}
      <AdminOrderActions order={order} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoCard label={t('admin.orders.status')}>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(order.status)}`}>
            {t(`status.${order.status}`)}
          </span>
        </InfoCard>
        <InfoCard label={t('admin.orders.branch')}>{order.branch_name}</InfoCard>
        <InfoCard label={t('admin.orders.total')}>
          <Price value={order.total_price} />
        </InfoCard>
        <InfoCard label={t('admin.orders.shippingFee')}>
          <span dir="ltr">{fmt(order.shipping_fee || 0)} {currencySP}</span>
        </InfoCard>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-sm">
        <h2 className="font-semibold text-base">{t('admin.orders.details')}</h2>
        <Row label={t('admin.orders.deposit')}>
          <span dir="ltr">{fmt(order.deposit_amount)} {currency} ({order.deposit_percent}%)</span>
        </Row>
        {order.delivery_address && (
          <Row label={t('admin.orders.address')}>{order.delivery_address}</Row>
        )}
        {order.customer_note && (
          <Row label={t('admin.orders.note')}>{order.customer_note}</Row>
        )}
        {order.estimated_delivery && (
          <Row label={t('admin.orders.estimatedDelivery')} dir="ltr">{order.estimated_delivery}</Row>
        )}
        {order.delivery_staff_name && (
          <Row label={t('admin.orders.deliveryStaff')}>{order.delivery_staff_name}</Row>
        )}
        {order.rejection_reason && (
          <Row label={t('admin.orders.rejectionReason')} className="text-destructive">{order.rejection_reason}</Row>
        )}
        {order.receipt_image && (
          <Row label={t('admin.orders.receipt')}>
            <a
              href={resolveMediaUrl(order.receipt_image) ?? order.receipt_image}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {t('admin.orders.viewReceipt')}
            </a>
          </Row>
        )}
      </div>

      {/* Items */}
      {order.items?.length > 0 && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-4 py-3">
            <h2 className="font-semibold">{t('admin.orders.items')}</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/20">
              <tr>
                <th className="px-4 py-2 text-start font-medium text-muted-foreground">{t('admin.orders.product')}</th>
                <th className="px-4 py-2 text-start font-medium text-muted-foreground">{t('admin.orders.qty')}</th>
                <th className="px-4 py-2 text-start font-medium text-muted-foreground">{t('admin.orders.unitPrice')}</th>
                <th className="px-4 py-2 text-start font-medium text-muted-foreground">{t('admin.orders.subtotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5">{item.product_name}</td>
                  <td className="px-4 py-2.5">{item.quantity}</td>
                  <td className="px-4 py-2.5 tabular-nums"><Price value={item.unit_price} /></td>
                  <td className="px-4 py-2.5 tabular-nums"><Price value={item.subtotal ?? item.unit_price} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status logs */}
      {order.logs?.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-base">{t('admin.orders.statusLog')}</h2>
          <div className="space-y-2">
            {order.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">
                    {log.old_status ? `${t(`status.${log.old_status}`)} ← ` : ''}
                    {t(`status.${log.new_status}`)}
                  </span>
                  {log.changed_by_name && (
                    <span className="text-muted-foreground"> · {log.changed_by_name}</span>
                  )}
                  {log.note && <p className="text-muted-foreground mt-0.5">{log.note}</p>}
                  <p className="text-xs text-muted-foreground font-mono" dir="ltr">{log.changed_at?.slice(0, 16).replace('T', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="font-semibold">{children}</div>
    </div>
  )
}

function Row({ label, children, dir, className }: { label: string; children: React.ReactNode; dir?: string; className?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className={`flex-1 ${className ?? ''}`} dir={dir}>{children}</span>
    </div>
  )
}
