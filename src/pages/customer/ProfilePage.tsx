import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Pencil, Phone, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileForm } from '@/features/auth/ProfileForm'
import { useMe } from '@/features/auth/queries'
import type { User } from '@/types/api'

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: user, isLoading, isError } = useMe()
  const [isEditing, setIsEditing] = useState(false)

  // Drop edit mode if user data goes away (e.g., after logout).
  useEffect(() => {
    if (!user) setIsEditing(false)
  }, [user])

  const initials = useMemo(() => {
    if (!user) return ''
    const first = user.first_name?.trim().charAt(0) ?? ''
    const last = user.last_name?.trim().charAt(0) ?? ''
    const combo = (first + last).toUpperCase()
    if (combo) return combo
    return user.phone?.replace(/\D/g, '').slice(-2) || 'U'
  }, [user])

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    : ''

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Hero card */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-secondary text-secondary-foreground shadow-sm">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,rgba(212,175,55,0.22),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(212,175,55,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />

        <div className="flex flex-col items-center gap-5 px-6 py-8 text-center sm:flex-row sm:text-start">
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/25 blur-xl"
            />
            {isLoading ? (
              <Skeleton className="size-20 rounded-full bg-secondary-foreground/10" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary text-2xl font-extrabold ring-4 ring-primary/40 shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                {initials}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-1.5 sm:items-start">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-40 bg-secondary-foreground/10" />
                <Skeleton className="h-4 w-32 bg-secondary-foreground/10" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold leading-tight">
                  {fullName || t('auth.profile.title')}
                </h1>
                {user?.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 text-sm text-secondary-foreground/75 transition-colors hover:text-primary"
                  >
                    <Phone className="size-3.5" />
                    {user.phone}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">
              {t('auth.profile.detailsTitle')}
            </CardTitle>
            <CardDescription>{t('auth.profile.subtitle')}</CardDescription>
          </div>
          {!isEditing && user && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="shrink-0"
            >
              <Pencil />
              <span>{t('common.edit')}</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && <ProfileSkeleton />}
          {isError && (
            <p className="text-sm text-destructive">{t('errors.generic')}</p>
          )}
          {user && !isLoading && (
            <>
              {isEditing ? (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                  <ProfileForm
                    initial={user}
                    submitLabel={t('common.save')}
                    onSuccess={() => setIsEditing(false)}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              ) : (
                <ProfileView user={user} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileView({ user }: { user: User }) {
  const { t } = useTranslation()
  return (
    <dl className="grid gap-5 animate-in fade-in duration-300">
      <Field
        icon={Phone}
        label={t('auth.profile.phone')}
        value={user.phone}
        ltr
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          icon={UserIcon}
          label={t('auth.profile.firstName')}
          value={user.first_name}
        />
        <Field
          icon={UserIcon}
          label={t('auth.profile.lastName')}
          value={user.last_name}
        />
      </div>
      <Field
        icon={MapPin}
        label={t('auth.profile.address')}
        value={user.address}
      />
    </dl>
  )
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string | null
  ltr?: boolean
}

function Field({ icon: Icon, label, value, ltr }: FieldProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
      <dt className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={`text-base font-medium ${
          value ? 'text-foreground' : 'text-muted-foreground italic'
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  )
}
