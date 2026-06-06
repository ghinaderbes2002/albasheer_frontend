import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useFeaturedProducts } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { formatPrice, pickLang } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

type FP = {
  id: number
  name: string
  name_ar: string
  slug: string
  price: string
  main_image: string | null
}

// Brand-matched backgrounds: gold tint / white card / warm muted
const CARD_BG = [
  'bg-brand-100/40 dark:bg-ink-900 shadow-warm',
  'bg-card dark:bg-ink-800 border border-border/60 shadow-warm',
  'bg-muted dark:bg-ink-900 shadow-warm',
]

export function FeaturedProductsSection() {
  const { t, i18n } = useTranslation()
  const { data: products, isLoading } = useFeaturedProducts()
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const isRtl = i18n.language.startsWith('ar')
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const lang = i18n.language

  const items = (products ?? []).slice(0, 3)

  if (!isLoading && items.length === 0) return null

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-7xl px-4 py-16">
      {/* Centered header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          {t('home.featured.badge')}
        </p>
        <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
          {t('home.featured.title')}
        </h2>
      </motion.div>

      {/* Bento grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="min-h-[260px] rounded-3xl md:col-span-2 md:min-h-0 md:row-span-2" style={{ gridRow: 'span 2' }} />
          <Skeleton className="h-[200px] rounded-3xl md:col-span-3" />
          <Skeleton className="h-[200px] rounded-3xl md:col-span-3" />
        </div>
      ) : (
        <div className="grid gap-4 md:auto-rows-[230px] md:grid-cols-5">
          {items[0] && (
            <BentoCard
              product={items[0]}
              big
              lang={lang}
              bg={CARD_BG[0]}
              isInView={isInView}
              delay={0}
              Arrow={Arrow}
            />
          )}
          {items[1] && (
            <BentoCard
              product={items[1]}
              lang={lang}
              bg={CARD_BG[1]}
              isInView={isInView}
              delay={0.12}
              Arrow={Arrow}
            />
          )}
          {items[2] && (
            <BentoCard
              product={items[2]}
              lang={lang}
              bg={CARD_BG[2]}
              isInView={isInView}
              delay={0.22}
              Arrow={Arrow}
            />
          )}
        </div>
      )}

      {/* View all ────────────────────────────────────────────────── */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            {t('home.featured.viewAll')}
            <Arrow className="size-4" />
          </Link>
        </motion.div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BentoCard
// big  → col-span-2 row-span-2, tall card, image stacks on top on mobile
// small → col-span-3, shorter card, image always on one side
// ─────────────────────────────────────────────────────────────────────────────
function BentoCard({
  product,
  big = false,
  lang,
  bg,
  isInView,
  delay,
  Arrow,
}: {
  product: FP
  big?: boolean
  lang: string
  bg: string
  isInView: boolean
  delay: number
  Arrow: React.ComponentType<{ className?: string }>
}) {
  const { t } = useTranslation()
  const name = pickLang(product.name, product.name_ar, lang)
  const image = resolveMediaUrl(product.main_image)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'group overflow-hidden rounded-3xl',
        bg,
        big
          ? 'min-h-[280px] md:col-span-2 md:row-span-2'
          : 'min-h-[160px] md:col-span-3',
      ].join(' ')}
    >
      {/*
        DOM order: [Text] [Image]
        Big card mobile  → flex-col-reverse  → Image appears on TOP, Text on BOTTOM ✓
        Big card desktop → flex-row (RTL)    → Text on RIGHT, Image on LEFT ✓
        Small cards      → flex-row always   → Text on start side, Image on end side ✓
      */}
      <Link
        to={`/products/${product.slug}`}
        className={[
          'flex h-full',
          big ? 'flex-col-reverse md:flex-row' : 'flex-row',
        ].join(' ')}
      >
        {/* ── Text zone ─────────────────────────────────────────── */}
        <div
          className={[
            'flex flex-col justify-end p-5',
            big ? 'md:w-1/2 md:justify-center md:p-8' : 'flex-1 justify-center',
          ].join(' ')}
        >
          <h3
            className={[
              'mb-2 font-extrabold leading-snug',
              big ? 'line-clamp-4 text-xl md:text-2xl' : 'line-clamp-3 text-base md:text-lg',
            ].join(' ')}
          >
            {name}
          </h3>

          <p className="mb-4 text-sm font-bold text-primary md:text-base">
            {formatPrice(product.price, lang)}{' '}
            <span className="text-xs font-normal text-muted-foreground">{t('common.currency')}</span>
          </p>

          {/* Outlined pill CTA */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/25 px-4 py-1.5 text-xs font-semibold text-foreground transition-all group-hover:border-primary group-hover:text-primary">
            {t('catalog.view')}
            <Arrow className="size-3" />
          </span>
        </div>

        {/* ── Image zone ────────────────────────────────────────── */}
        <div
          className={[
            'relative shrink-0 overflow-hidden',
            big
              ? 'h-52 w-full md:h-auto md:w-1/2'
              : 'w-[42%]',
          ].join(' ')}
        >
          {/* Arch shape on image for small cards */}
          {!big && (
            <div className="absolute inset-0 z-10 pointer-events-none" />
          )}

          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              className={[
                'h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]',
                // Arch effect on small cards: round the inner edge corners
                !big ? 'rounded-s-[40px]' : '',
              ].join(' ')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-muted-foreground/20">
              📦
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
