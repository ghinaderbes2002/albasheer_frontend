import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingBag } from 'lucide-react'

import { useFavorites } from '@/features/catalog/queries'
import { ProductGrid } from '@/features/catalog/ProductGrid'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function FavoritesPage() {
  const { t } = useTranslation()
  const { data: favorites, isLoading } = useFavorites()

  const count = favorites?.length ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={t('catalog.favorites', { defaultValue: 'المفضلة' })}
        url="/favorites"
      />

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-500">
              <Heart className="size-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {t('catalog.favorites', { defaultValue: 'المفضلة' })}
              </h1>
              {isLoading ? (
                <Skeleton className="mt-1 h-4 w-20" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {count > 0
                    ? t('catalog.favoritesCount', { count, defaultValue: `${count} منتج` })
                    : t('catalog.noFavorites', { defaultValue: 'لا توجد منتجات' })}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link to="/products">
              <ShoppingBag className="size-4" />
              {t('nav.products')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {!isLoading && count === 0 ? (
          <div className="flex flex-col items-center gap-5 py-28 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Heart className="size-10 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">
                {t('catalog.noFavorites', { defaultValue: 'قائمة المفضلة فارغة' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('catalog.noFavoritesHint', { defaultValue: 'اضغط على القلب بجانب أي منتج لإضافته هنا' })}
              </p>
            </div>
            <Button asChild className="mt-2">
              <Link to="/products">
                {t('catalog.browsProducts', { defaultValue: 'تصفح المنتجات' })}
              </Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={favorites} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
