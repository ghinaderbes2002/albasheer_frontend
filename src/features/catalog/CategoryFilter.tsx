import { useTranslation } from 'react-i18next'
import { useCategories } from '@/features/catalog/queries'
import { pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryFilterProps {
  active: string | null
  onChange: (slug: string | null) => void
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const { t, i18n } = useTranslation()
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    )
  }

  const Chip = ({
    isActive,
    label,
    onClick,
  }: {
    isActive: boolean
    label: string
    onClick: () => void
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow]',
        isActive
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        isActive={!active}
        label={t('common.all')}
        onClick={() => onChange(null)}
      />
      {categories?.map((c) => (
        <Chip
          key={c.id}
          isActive={active === c.slug}
          label={pickLang(c.name, c.name_ar, i18n.language)}
          onClick={() => onChange(c.slug)}
        />
      ))}
    </div>
  )
}
