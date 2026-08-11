import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Inbox, Loader2, Pencil, Search, X } from 'lucide-react'
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
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.main_image ? (
                          <img
                            src={resolveMediaUrl(p.main_image) ?? p.main_image}
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
                          <p className="font-medium">{p.name_ar}</p>
                          <p className="text-xs text-muted-foreground">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {p.category_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <Price value={p.price} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${stockBadgeClass[stockLevel(p.stock_quantity)]}`}
                      >
                        {p.stock_quantity > 0
                          ? p.stock_quantity
                          : t('admin.products.outOfStock')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(p.id)}
                        aria-label={t('accountant.products.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
