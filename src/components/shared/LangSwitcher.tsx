import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LangSwitcher() {
  const { i18n, t } = useTranslation()
  const next = i18n.language.startsWith('ar') ? 'en' : 'ar'
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={t('common.language')}
    >
      <Languages />
      <span className="hidden sm:inline">
        {next === 'ar' ? 'العربية' : 'English'}
      </span>
    </Button>
  )
}
