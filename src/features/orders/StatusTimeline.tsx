import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/features/orders/StatusBadge'
import type { OrderLog } from '@/types/api'

interface StatusTimelineProps {
  logs: OrderLog[]
}

export function StatusTimeline({ logs }: StatusTimelineProps) {
  const { t, i18n } = useTranslation()
  if (!logs.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('orders.noLogs')}</p>
    )
  }

  // Show newest first
  const ordered = [...logs].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  )

  return (
    <ol className="relative space-y-5">
      {ordered.map((log, idx) => {
        const isLast = idx === ordered.length - 1
        return (
          <li key={log.id} className="relative ps-6">
            {/* connector line */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute start-[7px] top-4 bottom-[-1.25rem] w-0.5 bg-border"
              />
            )}
            {/* dot */}
            <span
              aria-hidden
              className={cn(
                'absolute start-0 top-1.5 size-4 rounded-full ring-2 ring-background',
                idx === 0 ? 'bg-primary' : 'bg-muted',
              )}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge status={log.new_status} />
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(log.changed_at, i18n.language)}
                </span>
              </div>
              {(log.changed_by_name || log.note) && (
                <div className="text-xs text-muted-foreground">
                  {log.changed_by_name && (
                    <span>{log.changed_by_name}</span>
                  )}
                  {log.changed_by_name && log.note && (
                    <span className="mx-1">·</span>
                  )}
                  {log.note && <span>{log.note}</span>}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
