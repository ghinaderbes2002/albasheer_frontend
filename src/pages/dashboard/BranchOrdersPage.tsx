import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { BranchOrderRow } from '@/features/branchDashboard/BranchOrderRow'
import {
  StatusFilterChips,
  type StatusFilter,
} from '@/features/branchDashboard/StatusFilterChips'
import { useBranchOrders } from '@/features/branchDashboard/queries'

export function BranchOrdersPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const { data, isLoading, isError } = useBranchOrders(
    filter === 'all' ? {} : { status: filter },
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('dashboard.branch.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.branch.subtitle')}
        </p>
      </header>

      <StatusFilterChips value={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState message={t('errors.generic')} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          message={
            filter === 'all'
              ? t('dashboard.branch.empty')
              : t('dashboard.branch.emptyForFilter')
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((o) => (
            <BranchOrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
      <Inbox className="size-10" />
      <p>{message}</p>
    </div>
  )
}
