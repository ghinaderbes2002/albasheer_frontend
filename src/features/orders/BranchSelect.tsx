import { useTranslation } from 'react-i18next'
import { useBranches } from '@/features/branches/queries'
import { cn } from '@/lib/utils'

interface BranchSelectProps {
  value: number | null
  onChange: (id: number) => void
  disabled?: boolean
  invalid?: boolean
  id?: string
}

export function BranchSelect({
  value,
  onChange,
  disabled,
  invalid,
  id,
}: BranchSelectProps) {
  const { t } = useTranslation()
  const { data: branches, isLoading } = useBranches()

  const activeBranches = branches?.filter((b) => b.is_active) ?? []

  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      disabled={disabled || isLoading}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30',
      )}
    >
      <option value="" disabled>
        {isLoading ? t('common.loading') : t('checkout.selectBranch')}
      </option>
      {activeBranches.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name} — {b.city}
        </option>
      ))}
    </select>
  )
}
