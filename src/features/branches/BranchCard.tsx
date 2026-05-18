import { useTranslation } from 'react-i18next'
import { MapPin, Phone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
}

export function BranchCard({ branch }: BranchCardProps) {
  const { t } = useTranslation()
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8">
      {/* Gold accent bar */}
      <div className="h-1 bg-linear-to-r from-brand-400 to-brand-600" />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-card-foreground leading-tight">
            {branch.name}
          </h3>
          {!branch.is_active && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {t('branches.inactive')}
            </Badge>
          )}
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-foreground">{branch.city}</span>
              {' — '}
              {branch.address}
            </span>
          </div>

          <a
            href={`tel:${branch.phone}`}
            dir="ltr"
            className="inline-flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Phone className="size-3.5 shrink-0" />
            {branch.phone}
          </a>
        </div>
      </div>
    </div>
  )
}
