import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PhoneForm } from '@/features/auth/PhoneForm'
import { useAuthStore } from '@/store/auth'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/'

  if (accessToken) return <Navigate to={from} replace />

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneForm
            onSuccess={(phone) =>
              navigate(`/verify?phone=${encodeURIComponent(phone)}`, {
                state: { from: location.state?.from },
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
