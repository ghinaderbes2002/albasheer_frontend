import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BranchSelect } from '@/features/orders/BranchSelect'
import { useCreateOrder } from '@/features/orders/queries'
import {
  checkoutSchema,
  type CheckoutFormValues,
} from '@/features/orders/validators'
import { useMe } from '@/features/auth/queries'
import { useCartStore, useCartSubtotal } from '@/store/cart'
import { extractApiError } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'

const errorKey = (msg?: string) => {
  switch (msg) {
    case 'branch.required':
      return 'checkout.errors.branchRequired'
    case 'address.tooShort':
      return 'auth.profile.addressTooShort'
    case 'deposit.invalid':
      return 'checkout.errors.depositInvalid'
    default:
      return null
  }
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartSubtotal()
  const { data: me } = useMe()
  const createOrder = useCreateOrder()

  const depositSuggestion = String(Math.round(subtotal * 0.1))

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      branch_id: undefined as unknown as number,
      delivery_address: '',
      deposit_amount: depositSuggestion,
      customer_note: '',
    },
  })

  // Prefill address from /me when it arrives.
  useEffect(() => {
    if (me) {
      reset((prev) => ({
        ...prev,
        delivery_address: prev.delivery_address || me.address || '',
      }))
    }
  }, [me, reset])

  if (items.length === 0) return <Navigate to="/cart" replace />

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createOrder.mutateAsync({
        branch_id: values.branch_id,
        delivery_address: values.delivery_address,
        deposit_amount: values.deposit_amount,
        customer_note: values.customer_note || undefined,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      })
      toast.success(t('checkout.created'))
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  })

  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const busy = isSubmitting || createOrder.isPending

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">
        {t('checkout.title')}
      </h1>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checkout.branch.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="branch">{t('checkout.branch.label')}</Label>
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <BranchSelect
                    id="branch"
                    value={field.value || null}
                    onChange={field.onChange}
                    disabled={busy}
                    invalid={!!errors.branch_id}
                  />
                )}
              />
              {errors.branch_id && (
                <p className="text-xs text-destructive">
                  {t(
                    errorKey(errors.branch_id.message) ??
                      'checkout.errors.branchRequired',
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checkout.delivery.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="delivery_address">
                  {t('checkout.delivery.address')}
                </Label>
                <Input
                  id="delivery_address"
                  disabled={busy}
                  aria-invalid={!!errors.delivery_address || undefined}
                  {...register('delivery_address')}
                />
                {errors.delivery_address && (
                  <p className="text-xs text-destructive">
                    {t(
                      errorKey(errors.delivery_address.message) ??
                        'auth.profile.addressTooShort',
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="customer_note">
                  {t('checkout.delivery.note')}
                </Label>
                <Textarea
                  id="customer_note"
                  rows={3}
                  placeholder={t('checkout.delivery.notePlaceholder')}
                  disabled={busy}
                  {...register('customer_note')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checkout.deposit.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="deposit_amount">
                {t('checkout.deposit.label')}
              </Label>
              <Input
                id="deposit_amount"
                type="text"
                inputMode="numeric"
                dir="ltr"
                disabled={busy}
                aria-invalid={!!errors.deposit_amount || undefined}
                {...register('deposit_amount')}
              />
              {errors.deposit_amount ? (
                <p className="text-xs text-destructive">
                  {t(
                    errorKey(errors.deposit_amount.message) ??
                      'checkout.errors.depositInvalid',
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('checkout.deposit.hint', {
                    amount: formatPrice(depositSuggestion, i18n.language),
                    currency: t('common.currency'),
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-20 self-start">
          <CardHeader>
            <CardTitle className="text-base">
              {t('checkout.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              {items.map((i) => (
                <div
                  key={i.product_id}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="line-clamp-1 flex-1 text-muted-foreground">
                    {pickLang(i.name, i.name_ar, i18n.language)}
                    <span className="mx-1 text-xs">×{i.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      parseFloat(i.price) * i.quantity,
                      i18n.language,
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-2 h-px bg-border" />

            <div className="flex items-baseline justify-between">
              <span className="font-semibold">
                {t('cart.summary.total')}
              </span>
              <div className="flex items-baseline gap-1.5 text-primary">
                <span className="text-xl font-bold">
                  {formatPrice(subtotal, i18n.language)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('common.currency')}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-3 w-full"
              disabled={busy}
            >
              {busy && <Loader2 className="animate-spin" />}
              {t('checkout.submit')}
              <Arrow />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
