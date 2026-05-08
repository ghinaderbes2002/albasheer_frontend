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

export function VerifyOtpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') ?? ''

  if (!phone) return <Navigate to="/login" replace />

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/'

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
                navigate('/complete-profile', { replace: true })
              } else {
                navigate(from, { replace: true })
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
