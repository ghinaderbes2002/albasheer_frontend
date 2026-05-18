import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Star, Truck } from 'lucide-react'

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
  const { t, i18n } = useTranslation()
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

  const isAr = i18n.language.startsWith('ar')
  const stats = isAr
    ? [
        { icon: Star,        num: '+500', label: 'منتج متنوع' },
        { icon: Truck,       num: '+20',  label: 'مدينة للتوصيل' },
        { icon: ShieldCheck, num: '5★',  label: 'خدمة موثوقة' },
      ]
    : [
        { icon: Star,        num: '500+', label: 'Products' },
        { icon: Truck,       num: '20+',  label: 'Delivery Cities' },
        { icon: ShieldCheck, num: '5★',  label: 'Trusted Service' },
      ]

  return (
    <div className="flex min-h-svh">

      {/* ── Brand panel (desktop only) ───────────────────────────── */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-secondary px-12 lg:flex lg:w-5/12">
        {/* Dot-grid pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.22) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Ambient orbs */}
        <div aria-hidden className="absolute -top-40 -inset-e-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -inset-s-20 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
            <img
              src="/images/logo_al_basheer-removebg-preview.png"
              alt="البشير"
              className="relative h-28 w-28 object-contain drop-shadow-[0_0_28px_rgba(212,175,55,0.65)]"
            />
          </div>

          <div>
            <h1 className="logo-shimmer text-4xl font-extrabold">البشير</h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
              Al Basheer Electronics
            </p>
          </div>

          <p className="max-w-65 text-sm leading-relaxed text-white/55">
            {t('common.tagline')}
          </p>

          {/* Stats */}
          <div className="mt-2 grid w-full grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, num, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-2 py-4 backdrop-blur-sm"
              >
                <Icon className="size-4 text-primary" />
                <span className="text-xl font-extrabold text-primary">{num}</span>
                <span className="text-center text-[10px] leading-tight text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        {/* Logo — mobile only */}
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <img
            src="/images/logo_al_basheer-removebg-preview.png"
            alt="البشير"
            className="h-16 w-16 object-contain"
          />
          <p className="text-lg font-extrabold text-foreground">البشير للكهربائيات</p>
        </div>

        <div className="w-full max-w-md">
          <Card className="shadow-xl shadow-black/5 dark:shadow-black/40">
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
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t('auth.staffLogin.title')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
