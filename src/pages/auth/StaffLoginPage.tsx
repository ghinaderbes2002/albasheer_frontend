import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StaffLoginForm } from '@/features/auth/StaffLoginForm'
import { defaultHomeForRole, useAuthStore } from '@/store/auth'

export function StaffLoginPage() {
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
          <CardTitle className="text-2xl">
            {t('auth.staffLogin.title')}
          </CardTitle>
          <CardDescription>{t('auth.staffLogin.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <StaffLoginForm
            onSuccess={() =>
              navigate(fromExplicit ?? defaultHomeForRole(role), { replace: true })
            }
          />
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.staffLogin.customerLink')}{' '}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              {t('nav.login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
