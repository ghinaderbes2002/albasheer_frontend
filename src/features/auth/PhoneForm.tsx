import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { phoneSchema, type PhoneFormValues } from '@/features/auth/validators'
import { useRequestCode } from '@/features/auth/queries'
import { extractApiError } from '@/lib/api'

interface PhoneFormProps {
  onSuccess: (phone: string) => void
}

export function PhoneForm({ onSuccess }: PhoneFormProps) {
  const { t } = useTranslation()
  const requestCode = useRequestCode()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await requestCode.mutateAsync({ phone: values.phone })
      toast.success(t('auth.login.codeSent'))
      onSuccess(values.phone)
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

  const busy = isSubmitting || requestCode.isPending

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">
          <Phone className="size-4 text-muted-foreground" />
          {t('auth.login.phoneLabel')}
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          placeholder="09x xxx xxxx"
          aria-invalid={!!phoneError || undefined}
          {...register('phone')}
        />
        {phoneHint && (
          <p className="text-xs text-destructive">{phoneHint}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('auth.login.phoneHint')}
        </p>
      </div>

      <Button type="submit" disabled={busy} size="lg" className="mt-2">
        {busy && <Loader2 className="animate-spin" />}
        {t('auth.login.sendCode')}
      </Button>
    </form>
  )
}
