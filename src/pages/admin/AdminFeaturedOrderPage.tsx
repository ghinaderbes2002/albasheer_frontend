import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Loader2, Save, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useStaffFeatured, useUpdateFeaturedOrder } from '@/features/admin/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import type { FeaturedProductItem } from '@/api/admin'

export function AdminFeaturedOrderPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useStaffFeatured()
  const update = useUpdateFeaturedOrder()

  const [items, setItems] = useState<FeaturedProductItem[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (data) {
      setItems(data)
      setDirty(false)
    }
  }, [data])

  const move = (index: number, direction: -1 | 1) => {
    const next = [...items]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    setDirty(true)
  }

  const handleSave = async () => {
    try {
      await update.mutateAsync(
        items.map((item, i) => ({ id: item.id, order: i + 1 })),
      )
      toast.success(t('admin.featuredOrder.saved'))
      setDirty(false)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="size-6 text-primary" />
            {t('admin.featuredOrder.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.featuredOrder.subtitle')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || update.isPending}
          className="shrink-0"
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {t('admin.featuredOrder.save')}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Star className="mx-auto mb-3 size-10 opacity-20" />
          <p>{t('admin.featuredOrder.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <ProductRow
              key={item.id}
              item={item}
              position={i + 1}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({
  item,
  position,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  item: FeaturedProductItem
  position: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { i18n } = useTranslation()
  const image = resolveMediaUrl(item.main_image)
  const name = pickLang(item.name, item.name_ar, i18n.language)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-sm">
      {/* Position badge */}
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {position}
      </span>

      {/* Thumbnail */}
      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-muted-foreground/30">
            📦
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground" dir="ltr">
          {Number(item.price).toLocaleString('en-US')} USD
        </p>
      </div>

      {/* Arrow buttons */}
      <div className="flex flex-col gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isFirst}
          onClick={onMoveUp}
          title="تحريك للأعلى"
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isLast}
          onClick={onMoveDown}
          title="تحريك للأسفل"
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  )
}
