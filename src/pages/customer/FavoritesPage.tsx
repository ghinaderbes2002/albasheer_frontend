import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'

import { useFavorites } from '@/features/catalog/queries'
import { ProductGrid } from '@/features/catalog/ProductGrid'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'

export function FavoritesPage() {
  const { t } = useTranslation()
  const { data: favorites, isLoading } = useFavorites()

  return (
    <div>
      <Seo
        title={t('catalog.favorites', { defaultValue: 'المفضلة' })}
        url="/favorites"
      />
      <PageHero
        title={t('catalog.favorites', { defaultValue: 'المفضلة' })}
        subtitle={t('catalog.favoritesSubtitle', { defaultValue: 'منتجاتك المفضلة في مكان واحد' })}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {!isLoading && !favorites?.length ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center text-muted-foreground">
            <Heart className="size-14 opacity-20" />
            <p className="text-lg font-medium">{t('catalog.noFavorites', { defaultValue: 'قائمة المفضلة فارغة' })}</p>
            <p className="text-sm">{t('catalog.noFavoritesHint', { defaultValue: 'اضغط على القلب بجانب أي منتج لإضافته هنا' })}</p>
          </div>
        ) : (
          <ProductGrid products={favorites} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
