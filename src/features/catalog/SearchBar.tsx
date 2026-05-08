import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Debounce in ms. Default 300. */
  delay?: number
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  className,
  delay = 300,
}: SearchBarProps) {
  const { t } = useTranslation()
  const [local, setLocal] = useState(value)
  const debounced = useDebounce(local, delay)

  // Sync upstream when debounced value changes.
  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // Sync local when upstream resets (e.g., URL nav).
  useEffect(() => {
    if (value !== local) setLocal(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder ?? t('common.search')}
        className="ps-9 pe-9"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal('')}
          aria-label={t('common.cancel')}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
