import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/shared/Logo'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-auto border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
        <Logo />
        <p className="text-sm opacity-70">
          © {new Date().getFullYear()} {t('common.tagline')}
        </p>
      </div>
    </footer>
  )
}
