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
import { defaultHomeForRole, useAuthStore } from '@/store/auth'
import { carryFrom, fromPath, fromState } from '@/lib/redirect'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)

  if (accessToken) {
    return (
      <Navigate
        to={fromPath(location.state) ?? defaultHomeForRole(role)}
        replace
        state={fromState(location.state)}
      />
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
          <Card className="shadow-xl shadow-black/5 dark:shadow-black/40">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
              <CardDescription>{t('auth.login.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PhoneForm
                onSuccess={(phone) =>
                  navigate(`/verify?phone=${encodeURIComponent(phone)}`, {
                    state: carryFrom(location.state),
                  })
                }
              />
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
