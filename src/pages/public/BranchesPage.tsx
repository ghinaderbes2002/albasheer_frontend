import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { Seo } from '@/components/shared/Seo'

import { Skeleton } from '@/components/ui/skeleton'
import { BranchCard } from '@/features/branches/BranchCard'
import { useBranches } from '@/features/branches/queries'
import { PageHero } from '@/components/shared/PageHero'

export function BranchesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useBranches()

  return (
    <div>
      <Seo title={t('nav.branches')} description={t('branches.subtitle')} url="/branches" />
      <PageHero
        title={t('nav.branches')}
        subtitle={t('branches.subtitle')}
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80&auto=format&fit=crop"
      />
    <div className="mx-auto w-full max-w-7xl px-4 py-8">

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
    </div>
  )
}
