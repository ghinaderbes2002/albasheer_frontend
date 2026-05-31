import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ImageOff, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminCategories, useAdminProducts } from '@/features/admin/queries'
import { resolveMediaUrl } from '@/lib/api'
import type { AdminProduct } from '@/types/api'

export function AdminCategoryDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAr = i18n.language.startsWith('ar')
  const Arrow = isAr ? ArrowRight : ArrowLeft

  const { data: categories, isLoading: catLoading } = useAdminCategories()
  const category = categories?.find((c) => String(c.id) === id)

  const { data: products, isLoading: prodLoading } = useAdminProducts({
    category: id,
  })

  if (catLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
        <Package className="size-12" />
        <p>{t('errors.notFound')}</p>
        <Button variant="ghost" onClick={() => navigate('/admin/categories')}>
          <Arrow className="size-4" />
          {t('admin.categories.title')}
        </Button>
      </div>
    )
  }

  const image = resolveMediaUrl(category.image)
  const icon = resolveMediaUrl(category.icon)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/categories')}>
          <Arrow className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{category.name_ar || category.name}</h1>
          <p className="text-sm text-muted-foreground">{category.name}</p>
        </div>
      </div>

      {/* Category info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {image ? (
            <img src={image} alt={category.name_ar} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 items-center justify-center bg-muted text-muted-foreground/30">
              <ImageOff className="size-12" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          {icon && (
            <div className="flex items-center gap-3">
              <img src={icon} alt="" className="size-10 rounded-lg object-contain" />
              <span className="text-sm text-muted-foreground">{t('admin.categories.icon')}</span>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <Row label="Slug"><span dir="ltr" className="font-mono text-xs">{category.slug}</span></Row>
            <Row label={t('admin.categories.order')}><span>{category.order}</span></Row>
            <Row label={t('admin.categories.active')}>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {category.is_active ? t('admin.categories.active') : t('branches.inactive')}
              </span>
            </Row>
            <Row label={t('admin.categories.nameEn')}><span>{category.name}</span></Row>
            <Row label={t('admin.categories.nameAr')}><span>{category.name_ar}</span></Row>
          </div>
        </div>
      </div>

      {/* Products in this category */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t('admin.nav.products')}
          {products && (
            <span className="ms-2 text-sm font-normal text-muted-foreground">({products.length})</span>
          )}
        </h2>

        {prodLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ProductsTable products={products} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card py-12 text-center text-muted-foreground">
            <Package className="size-8" />
            <p className="text-sm">{t('admin.categories.empty')}</p>
          </div>
        )}
      </section>
    </div>
  )
}

function ProductsTable({ products }: { products: AdminProduct[] }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.nameAr')}</th>
            <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden sm:table-cell">{t('admin.products.nameEn')}</th>
            <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t('admin.products.price')}</th>
            <th className="px-4 py-3 text-start font-medium text-muted-foreground hidden md:table-cell">{t('admin.categories.active')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/products/${p.id}`)}
            >
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-2">
                  {p.main_image && (
                    <img
                      src={resolveMediaUrl(p.main_image) ?? ''}
                      alt=""
                      className="size-8 rounded object-cover"
                    />
                  )}
                  {i18n.language.startsWith('ar') ? p.name_ar : p.name}
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.name}</td>
              <td className="px-4 py-3 tabular-nums">
                <span dir="ltr">{Number(p.price).toLocaleString('en-US')} {t('common.currency')}</span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_available ? t('admin.categories.active') : t('catalog.outOfStock')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
