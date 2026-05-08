import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'

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
import { useAuthStore } from '@/store/auth'

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: user, isLoading, isError } = useMe()
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-2xl">
              {t('auth.profile.title')}
            </CardTitle>
            <CardDescription>{t('auth.profile.subtitle')}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            aria-label={t('nav.logout')}
          >
            <LogOut />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive">{t('errors.generic')}</p>
          )}
          {user && (
            <ProfileForm
              initial={user}
              submitLabel={t('common.save')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
