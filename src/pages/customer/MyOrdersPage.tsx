import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '@/components/shared/PagePlaceholder'

export function MyOrdersPage() {
  const { t } = useTranslation()
  return <PagePlaceholder title={t('nav.myOrders')} />
}
