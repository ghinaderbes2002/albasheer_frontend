import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { useFeaturedProducts } from '@/features/catalog/queries'
import { resolveMediaUrl } from '@/lib/api'
import { pickLang } from '@/lib/format'
import { prefersReducedMotion } from '@/hooks/useCascade'
import { Skeleton } from '@/components/ui/skeleton'
import { Price } from '@/components/shared/Price'

type FP = {
  id: number
  name: string
  name_ar: string
  slug: string
  price: string
  main_image: string | null
}

const CARD_BG = [
  'bg-brand-100/40 dark:bg-ink-900 shadow-warm',
  'bg-card dark:bg-ink-800 border border-border/60 shadow-warm',
  'bg-muted dark:bg-ink-900 shadow-warm',
]

/** Drift speed of the mobile strip, in pixels per second. */
const SCROLL_SPEED = 58
/** Quiet period after a swipe before the drift takes over again. */
const RESUME_AFTER_MS = 2500

/**
 * Drifts the mobile card strip continuously, so it reads as *moving* rather
 * than stepping between cards.
 *
 * The strip renders its cards twice; once the drift has travelled the width
 * of one full set it jumps back by exactly that distance. The content under
 * the viewport is identical at both ends, so the reset is invisible and the
 * loop never rewinds.
 *
 * Runs only while the strip is on screen, backs off after a swipe, and stays
 * off entirely when motion is unwanted.
 */
function useAutoScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  isRtl: boolean,
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el || itemCount < 2 || prefersReducedMotion()) return

    // RTL scroll offsets run from 0 down to -max, LTR from 0 up to +max.
    const direction = isRtl ? -1 : 1

    let frame: number | undefined
    let resume: number | undefined
    let onScreen = false
    let lastFrameAt = 0
    let position = Math.abs(el.scrollLeft)

    /** Distance covered by one full set of cards. */
    const loopWidth = () => {
      const cards = el.querySelectorAll<HTMLElement>('[data-carousel-item]')
      if (cards.length <= itemCount) return 0
      return Math.abs(cards[itemCount].offsetLeft - cards[0].offsetLeft)
    }

    const step = (now: number) => {
      const span = loopWidth()
      if (span > 0) {
        const elapsed = lastFrameAt ? (now - lastFrameAt) / 1000 : 0
        lastFrameAt = now
        // Clamp the delta so a backgrounded tab doesn't resume with a jump.
        position += SCROLL_SPEED * Math.min(elapsed, 0.05)
        if (position >= span) position -= span
        el.scrollLeft = direction * position
      }
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      frame = undefined
      lastFrameAt = 0
    }

    const start = () => {
      stop()
      // Pick up from wherever the reader left the strip.
      position = Math.abs(el.scrollLeft)
      frame = requestAnimationFrame(step)
    }

    const pause = () => {
      stop()
      if (resume !== undefined) window.clearTimeout(resume)
      resume = window.setTimeout(() => {
        if (onScreen) start()
      }, RESUME_AFTER_MS)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) start()
        else stop()
      },
      { threshold: 0.2 },
    )
    observer.observe(el)

    el.addEventListener('pointerdown', pause)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('wheel', pause, { passive: true })

    return () => {
      observer.disconnect()
      stop()
      if (resume !== undefined) window.clearTimeout(resume)
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('wheel', pause)
    }
  }, [containerRef, itemCount, isRtl])
}

export function FeaturedProductsSection() {
  const { t, i18n } = useTranslation()
  const { data: products, isLoading } = useFeaturedProducts()
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const isRtl = i18n.language.startsWith('ar')
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const lang = i18n.language

  const allItems = products ?? []
  const bentoItems = allItems.slice(0, 3)
  const extraItems = allItems.slice(3)

  useAutoScroll(stripRef, allItems.length, isRtl)

  if (!isLoading && allItems.length === 0) return null

  return (
    <section ref={sectionRef} className="w-full py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-10 px-4 text-center md:mx-auto md:max-w-7xl"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
          {t('home.featured.badge')}
        </p>
        <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
          {t('home.featured.title')}
        </h2>
      </motion.div>

      {isLoading ? (
        /* Skeleton */
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-5">
            <Skeleton className="h-[280px] rounded-3xl md:col-span-2 md:row-span-2" style={{ gridRow: 'span 2' }} />
            <Skeleton className="h-[200px] rounded-3xl md:col-span-3" />
            <Skeleton className="h-[200px] rounded-3xl md:col-span-3" />
          </div>
        </div>
      ) : (
        <>
          {/* ── Mobile: horizontal scroll (all items) ───────────── */}
          <div
            ref={stripRef}
            dir={isRtl ? 'rtl' : 'ltr'}
            // No scroll-snap: it would fight the continuous drift.
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 md:hidden"
          >
            {allItems.map((product, i) => (
              <MobileCard
                key={product.id}
                product={product}
                lang={lang}
                bg={CARD_BG[i % CARD_BG.length]}
                isInView={isInView}
                delay={i * 0.1}
                Arrow={Arrow}
              />
            ))}
            {/* Second pass of the same cards — gives the drift somewhere to
                wrap to without a visible rewind. Hidden from assistive tech
                and from the tab order so the list still reads once. */}
            {allItems.map((product, i) => (
              <MobileCard
                key={`${product.id}-loop`}
                product={product}
                lang={lang}
                bg={CARD_BG[i % CARD_BG.length]}
                isInView={isInView}
                delay={0}
                Arrow={Arrow}
                duplicate
              />
            ))}
          </div>

          {/* ── Desktop: bento grid (first 3) ───────────────────── */}
          <div className="mx-auto hidden max-w-7xl gap-4 px-4 md:grid md:auto-rows-[230px] md:grid-cols-5">
            {bentoItems[0] && (
              <BentoCard
                product={bentoItems[0]}
                big
                lang={lang}
                bg={CARD_BG[0]}
                isInView={isInView}
                delay={0}
                Arrow={Arrow}
              />
            )}
            {bentoItems[1] && (
              <BentoCard
                product={bentoItems[1]}
                lang={lang}
                bg={CARD_BG[1]}
                isInView={isInView}
                delay={0.12}
                Arrow={Arrow}
              />
            )}
            {bentoItems[2] && (
              <BentoCard
                product={bentoItems[2]}
                lang={lang}
                bg={CARD_BG[2]}
                isInView={isInView}
                delay={0.22}
                Arrow={Arrow}
              />
            )}
          </div>

          {/* ── Desktop: extra products (4th+) in a row ─────────── */}
          {extraItems.length > 0 && (
            <div className="mx-auto mt-4 hidden max-w-7xl gap-4 px-4 md:grid md:grid-cols-3">
              {extraItems.map((product, i) => (
                <BentoCard
                  key={product.id}
                  product={product}
                  compact
                  lang={lang}
                  bg={CARD_BG[(i + 3) % CARD_BG.length]}
                  isInView={isInView}
                  delay={0.3 + i * 0.1}
                  Arrow={Arrow}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* View all */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 flex justify-center px-4"
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
// MobileCard — fixed width, vertical layout, used in horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────
function MobileCard({
  product,
  lang,
  bg,
  isInView,
  delay,
  Arrow,
  duplicate = false,
}: {
  product: FP
  lang: string
  bg: string
  isInView: boolean
  delay: number
  Arrow: React.ComponentType<{ className?: string }>
  /** Part of the second pass that exists only so the drift can wrap. */
  duplicate?: boolean
}) {
  const { t } = useTranslation()
  const name = pickLang(product.name, product.name_ar, lang)
  const image = resolveMediaUrl(product.main_image)

  return (
    <motion.div
      data-carousel-item
      aria-hidden={duplicate || undefined}
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      // 75vw wide — reveals ~25% of the next card as scroll hint
      className={`group w-[75vw] shrink-0 overflow-hidden rounded-3xl ${bg}`}
    >
      <Link
        to={`/products/${product.slug}`}
        tabIndex={duplicate ? -1 : undefined}
        className="flex h-full flex-col"
      >
        {/* Image — 55% of card height */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-muted-foreground/20">
              📦
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <h3 className="line-clamp-2 text-base font-extrabold leading-snug">
            {name}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Price value={product.price} className="text-sm font-bold text-primary" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1 text-xs font-semibold text-foreground">
              {t('catalog.view')}
              <Arrow className="size-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BentoCard — desktop bento grid layout
// ─────────────────────────────────────────────────────────────────────────────
function BentoCard({
  product,
  big = false,
  compact = false,
  lang,
  bg,
  isInView,
  delay,
  Arrow,
}: {
  product: FP
  big?: boolean
  compact?: boolean
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
        !compact && (big ? 'md:col-span-2 md:row-span-2' : 'md:col-span-3'),
      ].filter(Boolean).join(' ')}
    >
      <Link
        to={`/products/${product.slug}`}
        className={['flex h-full', big ? 'flex-col-reverse md:flex-row' : 'flex-row'].join(' ')}
      >
        {/* Text zone */}
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
          <Price value={product.price} className="mb-4 text-sm font-bold text-primary md:text-base" />
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/25 px-4 py-1.5 text-xs font-semibold text-foreground transition-all group-hover:border-primary group-hover:text-primary">
            {t('catalog.view')}
            <Arrow className="size-3" />
          </span>
        </div>

        {/* Image zone */}
        <div
          className={[
            'relative shrink-0 overflow-hidden',
            big ? 'h-52 w-full md:h-auto md:w-1/2' : 'w-[42%]',
          ].join(' ')}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              decoding="async"
              className={[
                'h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]',
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
