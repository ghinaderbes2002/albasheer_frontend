import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Info, Loader2, Banknote, CreditCard } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateOrder } from '@/features/orders/queries'
import {
  checkoutSchema,
  type CheckoutFormValues,
} from '@/features/orders/validators'
import { useAddresses } from '@/features/addresses/queries'
import { useCities } from '@/features/branches/queries'
import { usePaymentMethods } from '@/features/paymentMethods/queries'
import { useCartStore } from '@/store/cart'
import { extractApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { formatPrice, pickLang } from '@/lib/format'

const errorKey = (msg?: string) => {
  switch (msg) {
    case 'city.required':
      return 'checkout.errors.cityRequired'
    case 'address.required':
      return 'checkout.errors.addressRequired'
    default:
      return null
  }
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const allItems = useCartStore((s) => s.items)
  const allBundles = useCartStore((s) => s.bundles)
  const removeItem = useCartStore((s) => s.removeItem)
  const removeBundle = useCartStore((s) => s.removeBundle)
  const clearCart = useCartStore((s) => s.clear)
  const { data: cities, isLoading: citiesLoading } = useCities()
  const { data: addresses } = useAddresses()
  const createOrder = useCreateOrder()

  // ── Single-item checkout via ?product=… or ?bundle=… ─────────────
  const onlyProductId = searchParams.get('product')
  const onlyBundleId = searchParams.get('bundle')
  const isSingleItem = !!(onlyProductId || onlyBundleId)

  const items = useMemo(() => {
    if (onlyBundleId) return []
    if (onlyProductId)
      return allItems.filter(
        (i) => String(i.product_id) === onlyProductId,
      )
    return allItems
  }, [allItems, onlyProductId, onlyBundleId])

  const bundles = useMemo(() => {
    if (onlyProductId) return []
    if (onlyBundleId)
      return allBundles.filter(
        (b) => String(b.bundle_id) === onlyBundleId,
      )
    return allBundles
  }, [allBundles, onlyProductId, onlyBundleId])

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + parseFloat(i.price) * i.quantity,
        0,
      ) +
      bundles.reduce(
        (sum, b) => sum + parseFloat(b.price) * b.quantity,
        0,
      ),
    [items, bundles],
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      city: '',
      address_id: undefined,
      customer_note: '',
    },
  })

  const selectedCityName = watch('city')
  const selectedCity = cities?.find((c) => c.name === selectedCityName)
  const requiresDeposit = selectedCity?.requires_deposit ?? false

  const { data: paymentMethods } = usePaymentMethods(
    selectedCity?.name,
    { enabled: requiresDeposit && !!selectedCity?.name },
  )

  const depositSuggestion = String(Math.round(subtotal * 0.1))

  // Prefill default address when addresses load.
  useEffect(() => {
    if (addresses?.length) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0]
      setValue('address_id', def.id)
    }
  }, [addresses, setValue])

  if (items.length === 0 && bundles.length === 0)
    return <Navigate to="/cart" replace />

  const onSubmit = handleSubmit(async (values) => {
    if (requiresDeposit && !values.payment_method_id) {
      toast.error(t('checkout.errors.paymentMethodRequired'))
      return
    }
    try {
      const order = await createOrder.mutateAsync({
        city: values.city,
        address_id: values.address_id,
        customer_note: values.customer_note || undefined,
        payment_method_id: values.payment_method_id,
        items: items.length
          ? items.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
            }))
          : undefined,
        bundle_items: bundles.length
          ? bundles.map((b) => ({
              bundle_id: b.bundle_id,
              quantity: b.quantity,
            }))
          : undefined,
      })

      if (isSingleItem) {
        if (onlyProductId) removeItem(parseInt(onlyProductId, 10))
        if (onlyBundleId) removeBundle(parseInt(onlyBundleId, 10))
      } else {
        clearCart()
      }

      const needsReceipt = parseFloat(order.deposit_amount ?? '0') > 0
      if (needsReceipt) {
        toast(
          (toastInstance) => (
            <button
              className="text-start text-sm"
              onClick={() => {
                toast.dismiss(toastInstance.id)
                navigate(`/orders/${order.id}#receipt-section`)
              }}
            >
              📎 {t('checkout.depositReminder')}
            </button>
          ),
          { duration: 8000 },
        )
      } else {
        toast.success(t('checkout.created'))
      }
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  })

  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const busy = isSubmitting || createOrder.isPending

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-3 text-2xl font-bold md:text-3xl">
        {t('checkout.title')}
      </h1>

      {isSingleItem && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {t('checkout.singleItem.title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('checkout.singleItem.hint')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout', { replace: true })}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('checkout.singleItem.checkoutAll')}
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="space-y-4">
          {/* City selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checkout.city.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="city">{t('checkout.city.label')}</Label>
              {citiesLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <select
                  id="city"
                  disabled={busy}
                  aria-invalid={!!errors.city || undefined}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.city && 'border-destructive ring-2 ring-destructive/30',
                  )}
                  {...register('city')}
                >
                  <option value="">{t('checkout.city.placeholder')}</option>
                  {cities?.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
              {errors.city && (
                <p className="text-xs text-destructive">
                  {t(errorKey(errors.city.message) ?? 'checkout.errors.cityRequired')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment method banner — shown once city is selected */}
          {selectedCityName && (
            <div className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
              requiresDeposit
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-green-500/30 bg-green-500/5',
            )}>
              {requiresDeposit ? (
                <Banknote className="mt-0.5 size-4 shrink-0 text-amber-600" />
              ) : (
                <CreditCard className="mt-0.5 size-4 shrink-0 text-green-600" />
              )}
              <div className="flex-1">
                <p className={cn(
                  'font-medium',
                  requiresDeposit ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400',
                )}>
                  {requiresDeposit
                    ? t('checkout.deposit.requiredTitle')
                    : t('checkout.deposit.codTitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {requiresDeposit
                    ? t('checkout.deposit.requiredHint', {
                        amount: formatPrice(depositSuggestion, i18n.language),
                        currency: t('common.currency'),
                      })
                    : t('checkout.deposit.codHint')}
                </p>

                {requiresDeposit && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <Label htmlFor="payment_method_id" className="text-foreground">
                      {t('checkout.deposit.paymentMethod')}
                    </Label>
                    <select
                      id="payment_method_id"
                      disabled={busy}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => {
                        const val = e.target.value
                        setValue('payment_method_id', val ? Number(val) : undefined)
                      }}
                      defaultValue=""
                    >
                      <option value="">{t('checkout.deposit.paymentMethodPlaceholder')}</option>
                      {paymentMethods?.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('checkout.delivery.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="address_id">
                  {t('checkout.delivery.address')}
                </Label>
                <select
                  id="address_id"
                  disabled={busy}
                  aria-invalid={!!errors.address_id || undefined}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.address_id && 'border-destructive ring-2 ring-destructive/30',
                  )}
                  onChange={(e) => setValue('address_id', Number(e.target.value))}
                  defaultValue=""
                >
                  <option value="">{t('checkout.delivery.addressPlaceholder')}</option>
                  {addresses?.map((a) => (
                    <option key={a.id} value={a.id} selected={a.is_default}>
                      {a.label} — {a.city}{a.full_address ? `, ${a.full_address}` : ''}
                    </option>
                  ))}
                </select>
                {errors.address_id && (
                  <p className="text-xs text-destructive">
                    {t(errorKey(errors.address_id.message) ?? 'checkout.errors.addressRequired')}
                  </p>
                )}
                <a
                  href="/addresses"
                  className="self-start text-xs text-primary hover:underline"
                >
                  {t('checkout.delivery.manageAddresses')}
                </a>
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
        </div>

        {/* Order summary sidebar */}
        <Card className="sticky top-20 self-start">
          <CardHeader>
            <CardTitle className="text-base">
              {t('checkout.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              {bundles.map((b) => (
                <div
                  key={`b-${b.bundle_id}`}
                  className="flex items-baseline justify-between gap-2"
                >
                  <span className="line-clamp-1 flex-1 text-muted-foreground">
                    <span className="me-1 inline-flex items-center gap-1 rounded bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                      {t('bundles.label')}
                    </span>
                    {pickLang(b.name, b.name_ar, i18n.language)}
                    <span className="mx-1 text-xs">×{b.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(
                      parseFloat(b.price) * b.quantity,
                      i18n.language,
                    )}
                  </span>
                </div>
              ))}
              {items.map((i) => (
                <div
                  key={`p-${i.product_id}`}
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
