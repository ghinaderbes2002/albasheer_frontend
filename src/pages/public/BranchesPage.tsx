import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { BranchCard } from '@/features/branches/BranchCard'
import { useBranches } from '@/features/branches/queries'

export function BranchesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBranches()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">{t('nav.branches')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('branches.subtitle')}
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Building2 className="size-10" />
          <p>{t('errors.generic')}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Building2 className="size-10" />
          <p>{t('branches.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>
      )}
    </div>
  )
}
