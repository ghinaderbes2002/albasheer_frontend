import { Skeleton } from '@/components/ui/skeleton'

/**
 * Small presentational pieces shared by the accountant report pages —
 * the same shapes the admin Reports page uses, kept local so the two can
 * drift independently.
 */

export function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
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

export function RankBadge({ rank }: { rank: number }) {
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

export function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex gap-4 bg-muted/50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-2.5">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </p>
  )
}
