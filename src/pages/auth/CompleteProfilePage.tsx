import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProfileForm } from '@/features/auth/ProfileForm'
import { useMe } from '@/features/auth/queries'

export function CompleteProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user, isLoading } = useMe()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t('auth.completeProfile.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.completeProfile.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={user}
            loading={isLoading}
            submitLabel={t('auth.completeProfile.submit')}
            onSuccess={() => navigate(from ?? '/', { replace: true })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
