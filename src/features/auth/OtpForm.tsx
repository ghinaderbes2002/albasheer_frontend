import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/features/auth/OtpInput'
import { otpSchema, type OtpFormValues } from '@/features/auth/validators'
import { useRequestCode, useVerifyCode } from '@/features/auth/queries'
import { extractApiError } from '@/lib/api'
import type { AuthResponse } from '@/types/api'

interface OtpFormProps {
  phone: string
  onSuccess: (auth: AuthResponse) => void
  resendSeconds?: number
}

const OTP_LENGTH = 5

export function OtpForm({
  phone,
  onSuccess,
  resendSeconds = 60,
}: OtpFormProps) {
  const { t } = useTranslation()
  const verifyCode = useVerifyCode()
  const requestCode = useRequestCode()
  const [secondsLeft, setSecondsLeft] = useState(resendSeconds)
  const submittedRef = useRef(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  })

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft])

  const onSubmit = handleSubmit(async (values) => {
    submittedRef.current = true
    try {
      const data = await verifyCode.mutateAsync({
        phone,
        code: values.code,
      })
      onSuccess(data)
    } catch (err) {
      const message = extractApiError(err, t('errors.generic'))
      setError('code', { type: 'server', message })
      toast.error(message)
    }
  })

  const handleResend = async () => {
    try {
      await requestCode.mutateAsync({ phone })
      setSecondsLeft(resendSeconds)
      toast.success(t('auth.login.codeSent'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  const codeErrorRaw = errors.code?.message
  const codeError =
    codeErrorRaw === 'code.invalid'
      ? t('auth.verify.codeInvalid')
      : codeErrorRaw

  const busy = isSubmitting || verifyCode.isPending

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-3">
        <Label className="justify-center">{t('auth.verify.codeLabel')}</Label>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OtpInput
              length={OTP_LENGTH}
              value={field.value}
              onChange={field.onChange}
              autoFocus
              disabled={busy}
              invalid={!!codeError}
              onComplete={() => {
                if (!submittedRef.current) onSubmit()
              }}
            />
          )}
        />
        {codeError && (
          <p className="text-center text-sm text-destructive">{codeError}</p>
        )}
      </div>

      <Button type="submit" disabled={busy} size="lg">
        {busy && <Loader2 className="animate-spin" />}
        {t('auth.verify.verify')}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {secondsLeft > 0 ? (
          <span>
            {t('auth.verify.resendIn', { seconds: secondsLeft })}
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={handleResend}
            disabled={requestCode.isPending}
          >
            {t('auth.verify.resend')}
          </Button>
        )}
      </div>
    </form>
  )
}
