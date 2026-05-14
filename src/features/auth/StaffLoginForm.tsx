import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, Lock, Phone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { staffLoginSchema, type StaffLoginFormValues } from '@/features/auth/validators'
import { useStaffLogin } from '@/features/auth/queries'
import { extractApiError } from '@/lib/api'

interface StaffLoginFormProps {
  onSuccess: () => void
}

export function StaffLoginForm({ onSuccess }: StaffLoginFormProps) {
  const { t } = useTranslation()
  const staffLogin = useStaffLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginFormValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { phone: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await staffLogin.mutateAsync(values)
      onSuccess()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  })

  const phoneError = errors.phone?.message
  const phoneHint =
    phoneError === 'phone.tooShort'
      ? t('auth.login.phoneTooShort')
      : phoneError === 'phone.tooLong'
        ? t('auth.login.phoneTooLong')
        : phoneError === 'phone.invalid'
          ? t('auth.login.phoneInvalid')
          : undefined

  const busy = isSubmitting || staffLogin.isPending

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="staff-phone">
          <Phone className="size-4 text-muted-foreground" />
          {t('auth.login.phoneLabel')}
        </Label>
        <Input
          id="staff-phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="username"
          placeholder="0912345678"
          aria-invalid={!!phoneError || undefined}
          {...register('phone')}
        />
        {phoneHint && (
          <p className="text-xs text-destructive">{phoneHint}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="staff-password">
          <Lock className="size-4 text-muted-foreground" />
          {t('auth.staffLogin.passwordLabel')}
        </Label>
        <div className="relative">
          <Input
            id="staff-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={!!errors.password || undefined}
            className="pe-10"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? t('auth.staffLogin.hidePassword') : t('auth.staffLogin.showPassword')}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">
            {t('common.required')}
          </p>
        )}
      </div>

      <Button type="submit" disabled={busy} size="lg" className="mt-2">
        {busy && <Loader2 className="animate-spin" />}
        {t('auth.staffLogin.submit')}
      </Button>
    </form>
  )
}
