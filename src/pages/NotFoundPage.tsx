import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <PagePlaceholder
      title="404"
      description={t('errors.notFound')}
      cta={{ label: t('nav.home'), to: '/' }}
    />
  )
}
