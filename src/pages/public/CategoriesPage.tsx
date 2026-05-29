import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, CheckSquare, ImageOff } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import { PageHero } from '@/components/shared/PageHero'

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const Arrow = i18n.language.startsWith('ar') ? ArrowLeft : ArrowRight
  const { data: categories, isLoading } = useCategories()

  return (
    <div>
      <PageHero
        title={t('home.categories.title')}
        subtitle={t('catalog.heroSubtitle')}
        image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&auto=format&fit=crop"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-16 space-y-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-72 rounded-3xl" />
              <Skeleton className="h-72 rounded-3xl" />
            </div>
          ))
        ) : categories && categories.length > 0 ? (
          categories.map((c, idx) => {
            const isEven = idx % 2 === 0
            const icon = resolveMediaUrl(c.icon)
            const name = pickLang(c.name, c.name_ar, i18n.language)

            return (
              <div
                key={c.id}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch"
              >
                {/* Image card */}
                <div className={!isEven ? 'md:order-2' : ''}>
                  <div className="relative h-72 overflow-hidden rounded-3xl bg-muted md:h-full min-h-64">
                    {icon ? (
                      <img
                        src={icon}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30">
                        <ImageOff className="size-16" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Text card */}
                <div className={!isEven ? 'md:order-1' : ''}>
                  <div className="relative flex h-full flex-col justify-center rounded-3xl border border-border bg-card p-8 shadow-warm">
                    {/* Checkmark badge */}
                    <div className="mb-5 flex justify-end">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
                        <CheckSquare className="size-5 text-primary" />
                      </span>
                    </div>

                    <h2 className="mb-3 text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
                      {name}
                    </h2>

                    {/* Description placeholder — fill when backend adds description field */}
                    <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                      {/* TODO: replace with c.description when available */}
                    </p>

                    <Link
                      to={`/products?category=${c.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-gap duration-200 hover:gap-3"
                    >
                      {t('home.hero.cta')}
                      <Arrow className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-muted-foreground">{t('home.categories.empty')}</p>
        )}
      </div>
    </div>
  )
}
