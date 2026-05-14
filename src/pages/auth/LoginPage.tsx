import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PhoneForm } from '@/features/auth/PhoneForm'
import { defaultHomeForRole, useAuthStore } from '@/store/auth'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)

  const fromExplicit = (
    location.state as { from?: { pathname?: string } } | null
  )?.from?.pathname

  if (accessToken) {
    return <Navigate to={fromExplicit ?? defaultHomeForRole(role)} replace />
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PhoneForm
            onSuccess={(phone) =>
              navigate(`/verify?phone=${encodeURIComponent(phone)}`, {
                state: { from: location.state?.from },
              })
            }
          />
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.staffLink')}{' '}
            <Link
              to="/staff/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('auth.staffLogin.title')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
