import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { OtpForm } from '@/features/auth/OtpForm'
import { defaultHomeForRole } from '@/store/auth'
import { carryFrom, fromPath, fromState } from '@/lib/redirect'

export function VerifyOtpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') ?? ''

  if (!phone) return <Navigate to="/login" replace />

  const resumePath = fromPath(location.state)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.verify.title')}</CardTitle>
          <CardDescription>
            {t('auth.verify.subtitle', { phone })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm
            phone={phone}
            onSuccess={(data) => {
              if (data.is_new) {
                // Hand the pending destination on; the profile step resumes it.
                navigate('/complete-profile', {
                  replace: true,
                  state: carryFrom(location.state),
                })
                return
              }
              // Role-based redirect: staff goes straight to their dashboard.
              navigate(resumePath ?? defaultHomeForRole(data.user.role), {
                replace: true,
                state: fromState(location.state),
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
