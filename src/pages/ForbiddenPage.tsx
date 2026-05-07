import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function ForbiddenPage() {
  const { t } = useTranslation()
  return (
    <PagePlaceholder
      title="403"
      description={t('errors.forbidden')}
      cta={{ label: t('nav.home'), to: '/' }}
    />
  )
}
