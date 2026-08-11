import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Inbox, Loader2, Minus, Pencil, Plus, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Price } from '@/components/shared/Price'
import {
  useAccountantProducts,
  useUpdateAccountantProduct,
} from '@/features/accountant/queries'
import { extractApiError, resolveMediaUrl } from '@/lib/api'
import { stockBadgeClass, stockLevel } from '@/lib/stock'
import type { AdminProduct } from '@/types/api'

/**
 * Read-only product list with an inline price/stock editor — the only two
 * fields the accountant endpoint accepts. Everything else is display only.
 */
export function AccountantProductsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading } = useAccountantProducts(
    debounced ? { search: debounced } : undefined,
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold md:text-3xl">
          {t('accountant.products.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('accountant.products.subtitle')}
        </p>
      </header>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.products.searchPlaceholder')}
          className="ps-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          <Inbox className="size-10" />
          <p>{t('admin.products.empty')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-3xl text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                  {t('admin.products.nameAr')}
                </th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">
                  {t('admin.products.category')}
                </th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                  {t('admin.products.price')}
                </th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                  {t('admin.products.inStock')}
                </th>
                <th className="px-4 py-3 text-end" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((p) =>
                editingId === p.id ? (
                  <EditRow
                    key={p.id}
                    product={p}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={() => setEditingId(p.id)}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * A read-only row, except for stock: −/+ adjust a pending count that is only
 * sent once the reader presses save. Price still needs the full edit form.
 */
function ProductRow({
  product,
  onEdit,
}: {
  product: AdminProduct
  onEdit: () => void
}) {
  const { t } = useTranslation()
  const update = useUpdateAccountantProduct()

  // `null` means untouched — show whatever the server has.
  const [draft, setDraft] = useState<number | null>(null)
  const stock = draft ?? product.stock_quantity
  // Resolves itself once the refetch lands, so there is no reset to time.
  const dirty = draft !== null && draft !== product.stock_quantity

  const save = async () => {
    try {
      await update.mutateAsync({
        id: product.id,
        payload: { stock_quantity: stock },
      })
      toast.success(t('accountant.products.saved'))
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.main_image ? (
            <img
              src={resolveMediaUrl(product.main_image) ?? product.main_image}
              alt=""
              loading="lazy"
              decoding="async"
              width={32}
              height={32}
              className="size-8 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="size-8 shrink-0 rounded bg-muted" />
          )}
          <div className="min-w-0">
            <p className="font-medium">{product.name_ar}</p>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
        {product.category_name ?? '—'}
      </td>

      <td className="px-4 py-3 tabular-nums">
        <Price value={product.price} />
      </td>

      {/* Stock — nudge with −/+, then save */}
      <td className="px-4 py-3">
        <div dir="ltr" className="inline-flex items-center gap-1">
          <StockButton
            icon={Minus}
            label="-"
            onClick={() => setDraft(Math.max(0, stock - 1))}
            disabled={stock <= 0 || update.isPending}
          />
          <span
            className={`inline-flex min-w-11 justify-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
              dirty
                ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                : stockBadgeClass[stockLevel(stock)]
            }`}
          >
            {stock > 0 ? stock : t('admin.products.outOfStock')}
          </span>
          <StockButton
            icon={Plus}
            label="+"
            onClick={() => setDraft(stock + 1)}
            disabled={update.isPending}
          />
        </div>
      </td>

      <td className="px-4 py-3 text-end">
        <div className="flex items-center justify-end gap-1">
          {dirty && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={save}
                disabled={update.isPending}
                aria-label={t('common.save')}
              >
                {update.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4 text-emerald-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDraft(null)}
                disabled={update.isPending}
                aria-label={t('common.cancel')}
              >
                <X className="size-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={t('accountant.products.edit')}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function StockButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-3" />
    </button>
  )
}

function EditRow({
  product,
  onDone,
}: {
  product: AdminProduct
  onDone: () => void
}) {
  const { t } = useTranslation()
  const update = useUpdateAccountantProduct()
  const [price, setPrice] = useState(product.price)
  const [stock, setStock] = useState(String(product.stock_quantity))

  const parsedPrice = parseFloat(price)
  const parsedStock = parseInt(stock, 10)
  const valid =
    !Number.isNaN(parsedPrice) &&
    parsedPrice >= 0 &&
    !Number.isNaN(parsedStock) &&
    parsedStock >= 0

  const save = async () => {
    try {
      // Only these two fields — the backend rejects anything else.
      await update.mutateAsync({
        id: product.id,
        payload: { price, stock_quantity: parsedStock },
      })
      toast.success(t('accountant.products.saved'))
      onDone()
    } catch (err) {
      toast.error(extractApiError(err, t('errors.generic')))
    }
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-4 py-3">
        <p className="font-medium">{product.name_ar}</p>
        <p className="text-xs text-muted-foreground">{product.name}</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
        {product.category_name ?? '—'}
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={0}
          step="0.01"
          dir="ltr"
          autoFocus
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={update.isPending}
          className="h-9 w-28"
          aria-label={t('admin.products.price')}
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={0}
          step={1}
          dir="ltr"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          disabled={update.isPending}
          className="h-9 w-24"
          aria-label={t('admin.products.stockQuantity')}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={save}
            disabled={!valid || update.isPending}
            aria-label={t('common.save')}
          >
            {update.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4 text-emerald-600" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDone}
            disabled={update.isPending}
            aria-label={t('common.cancel')}
          >
            <X className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
