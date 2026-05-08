import { useTranslation } from 'react-i18next'
import { MapPin, Phone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
}

export function BranchCard({ branch }: BranchCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="gap-3">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{branch.name}</CardTitle>
          {!branch.is_active && (
            <Badge variant="outline">{t('branches.inactive')}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">{branch.city}</span>
            {' — '}
            {branch.address}
          </span>
        </div>
        <a
          href={`tel:${branch.phone}`}
          dir="ltr"
          className="flex items-center gap-2 font-medium text-primary hover:underline"
        >
          <Phone className="size-4 shrink-0" />
          {branch.phone}
        </a>
      </CardContent>
    </Card>
  )
}
