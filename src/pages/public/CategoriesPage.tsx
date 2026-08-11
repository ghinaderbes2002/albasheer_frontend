import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ImageOff } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { CascadeItem } from '@/components/shared/CascadeItem'
import { useCascade } from '@/hooks/useCascade'
import type { Category } from '@/types/api'

/**
 * Slower and taller than the product grids — these are large feature tiles,
 * a handful of them, and the page has room for a deliberate reveal.
 */
const CATEGORY_CASCADE = {
  queue: { stagger: 190, batchGap: 900 },
  duration: 1000,
  distance: 48,
}

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const { data: categories, isLoading } = useCategories()
  // One queue shared by every tile, so they cascade as a single sequence.
  const nextDelay = useCascade(CATEGORY_CASCADE.queue)

  return (
    <div>
      <Seo title={t('home.categories.title')} url="/categories" />
      <PageHero
        title={t('home.categories.title')}
        subtitle={t('catalog.heroSubtitle')}
        image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&auto=format&fit=crop"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-14 lg:py-20">
        {isLoading ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-4/5 w-full rounded-3xl" />
              </li>
            ))}
          </ul>
        ) : categories && categories.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, idx) => (
              <CategoryTile
                key={c.id}
                category={c}
                index={idx}
                lang={i18n.language}
                cta={t('home.hero.cta')}
                nextDelay={nextDelay}
              />
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            {t('home.categories.empty')}
          </p>
        )}
      </div>
    </div>
  )
}

function CategoryTile({
  category,
  index,
  lang,
  cta,
  nextDelay,
}: {
  category: Category
  index: number
  lang: string
  cta: string
  nextDelay: () => number
}) {
  const Arrow = lang.startsWith('ar') ? ArrowLeft : ArrowRight

  const image = resolveMediaUrl(category.image) || resolveMediaUrl(category.icon)
  const name = pickLang(category.name, category.name_ar, lang)

  return (
    <CascadeItem
      as="li"
      nextDelay={nextDelay}
      duration={CATEGORY_CASCADE.duration}
      distance={CATEGORY_CASCADE.distance}
    >
      <Link
        to={`/products?category=${category.slug}`}
        className="group relative block aspect-4/5 overflow-hidden rounded-3xl bg-muted shadow-warm outline-none transition-shadow duration-500 hover:shadow-warm-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            width={480}
            height={600}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground/25">
            <ImageOff className="size-14" />
          </div>
        )}

        {/* Scrim — keeps the title readable over any photo, and deepens on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/5 transition-opacity duration-500 group-hover:from-black/90" />

        {/* Index badge — thin ring with the number centred inside */}
        <span
          aria-hidden
          dir="ltr"
          className="absolute top-4 inset-e-4 flex size-9 items-center justify-center rounded-full border border-white/40 text-[11px] font-semibold tabular-nums text-white/90 backdrop-blur-[2px] transition-[background-color,border-color] duration-500 group-hover:border-white/75 group-hover:bg-white/10 sm:size-10 sm:text-xs"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold leading-snug text-white drop-shadow-sm sm:text-2xl">
            {name}
          </h2>

          {/* Gold rule that extends on hover */}
          <span
            aria-hidden
            className="mt-3 block h-0.5 w-10 rounded-full bg-primary transition-[width] duration-500 ease-out group-hover:w-20 motion-reduce:transition-none"
          />

          {/* Hidden until hover on pointer devices; always visible on touch */}
          {/* Gap grows instead of translating the icon — reads the same in
              both directions, so no rtl/ltr special-casing is needed. */}
          <span className="mt-3 flex translate-y-0 items-center gap-2 text-sm font-semibold text-white opacity-90 transition-[opacity,transform,gap] duration-500 ease-out group-hover:gap-3 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 motion-reduce:transition-none">
            {cta}
            <Arrow className="size-4 shrink-0" />
          </span>
        </div>
      </Link>
    </CascadeItem>
  )
}
