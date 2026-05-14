import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Loader2,
  MapPin,
  Phone as PhoneIcon,
  User as UserIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateProfile } from '@/features/auth/queries'
import {
  profileSchema,
  type ProfileFormValues,
} from '@/features/auth/validators'
import { extractApiError } from '@/lib/api'
import type { User } from '@/types/api'

interface ProfileFormProps {
  initial?: Partial<User>
  submitLabel: string
  onSuccess?: (user: User) => void
  /** Optional cancel handler — renders a Cancel button next to Save. */
  onCancel?: () => void
  /** Disable inputs until `initial` arrives. */
  loading?: boolean
}

const errorKey = (msg?: string) => {
  switch (msg) {
    case 'required':
      return 'common.required'
    case 'address.tooShort':
      return 'auth.profile.addressTooShort'
    default:
      return null
  }
}

export function ProfileForm({
  initial,
  submitLabel,
  onSuccess,
  onCancel,
  loading,
}: ProfileFormProps) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: initial?.first_name ?? '',
      last_name: initial?.last_name ?? '',
      address: initial?.address ?? '',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        address: initial.address ?? '',
      })
    }
  }, [initial, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await updateProfile.mutateAsync(values)
      toast.success(t('auth.profile.saved'))
      onSuccess?.(user)
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  })

  const busy = isSubmitting || updateProfile.isPending || loading

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {initial?.phone && (
        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">
            <PhoneIcon className="size-3.5" />
            {t('auth.profile.phone')}
          </Label>
          <Input
            value={initial.phone}
            readOnly
            disabled
            dir="ltr"
            className="bg-muted/50 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            {t('auth.profile.phoneLocked')}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first_name">
            <UserIcon className="size-3.5" />
            {t('auth.profile.firstName')}
          </Label>
          <Input
            id="first_name"
            disabled={busy}
            placeholder={t('auth.profile.firstName')}
            aria-invalid={!!errors.first_name || undefined}
            {...register('first_name')}
          />
          {errors.first_name && (
            <p className="text-xs text-destructive">
              {t(errorKey(errors.first_name.message) ?? 'common.required')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="last_name">
            <UserIcon className="size-3.5" />
            {t('auth.profile.lastName')}
          </Label>
          <Input
            id="last_name"
            disabled={busy}
            placeholder={t('auth.profile.lastName')}
            aria-invalid={!!errors.last_name || undefined}
            {...register('last_name')}
          />
          {errors.last_name && (
            <p className="text-xs text-destructive">
              {t(errorKey(errors.last_name.message) ?? 'common.required')}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">
          <MapPin className="size-3.5" />
          {t('auth.profile.address')}
        </Label>
        <Input
          id="address"
          disabled={busy}
          placeholder={t('auth.profile.addressPlaceholder')}
          aria-invalid={!!errors.address || undefined}
          {...register('address')}
        />
        {errors.address ? (
          <p className="text-xs text-destructive">
            {t(errorKey(errors.address.message) ?? 'auth.profile.addressTooShort')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('auth.profile.addressHint')}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" disabled={busy || !isDirty}>
          {busy && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={busy}
          >
            {t('common.cancel')}
          </Button>
        )}
        {isDirty && !busy && (
          <span className="text-xs text-muted-foreground">
            {t('auth.profile.unsaved')}
          </span>
        )}
      </div>
    </form>
  )
}
