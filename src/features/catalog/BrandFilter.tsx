import { useTranslation } from 'react-i18next'
import { useCatalogBrands } from '@/features/catalog/queries'
import { pickLang } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface BrandFilterProps {
  active: string | null
  onChange: (slug: string | null) => void
}

export function BrandFilter({ active, onChange }: BrandFilterProps) {
  const { t, i18n } = useTranslation()
  const { data: brands, isLoading } = useCatalogBrands()

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
    )
  }

  if (!brands?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow]',
          !active
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
        )}
      >
        {t('common.all')}
      </button>
      {brands.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(active === b.slug ? null : b.slug)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow]',
            active === b.slug
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
          )}
        >
          {b.logo && (
            <img src={b.logo} alt="" loading="lazy" decoding="async" width={16} height={16} className="size-4 rounded-full object-contain" />
          )}
          {pickLang(b.name, b.name_ar, i18n.language)}
        </button>
      ))}
    </div>
  )
}
