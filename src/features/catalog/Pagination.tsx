import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalCount: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  onChange: (page: number) => void
}

export function Pagination({
  page,
  totalCount,
  pageSize,
  hasNext,
  hasPrevious,
  onChange,
}: PaginationProps) {
  const { t, i18n } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const isRtl = i18n.language.startsWith('ar')
  const Prev = isRtl ? ChevronRight : ChevronLeft
  const Next = isRtl ? ChevronLeft : ChevronRight

  if (totalCount <= pageSize) return null

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasPrevious}
        onClick={() => onChange(page - 1)}
      >
        <Prev />
        <span>{t('common.back')}</span>
      </Button>

      <div className="text-sm text-muted-foreground" dir="ltr">
        {page} / {totalPages}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onChange(page + 1)}
      >
        <span>{t('catalog.next')}</span>
        <Next />
      </Button>
    </div>
  )
}
