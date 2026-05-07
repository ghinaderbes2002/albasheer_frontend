import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface PagePlaceholderProps {
  title: string
  description?: string
  /** Optional CTA back to home etc. */
  cta?: { label: string; to: string }
}

/**
 * Temporary stub used while a real page is still being built.
 * Replace per-feature in later phases.
 */
export function PagePlaceholder({
  title,
  description,
  cta,
}: PagePlaceholderProps) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary text-xl font-bold ring-2 ring-primary/40">
        B
      </div>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-4 text-muted-foreground">{description}</p>
      )}
      <p className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">
        قيد البناء · Coming soon
      </p>
      {cta && (
        <Button asChild className="mt-6">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      )}
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}
