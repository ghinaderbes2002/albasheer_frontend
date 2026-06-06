import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAds } from '@/features/ads/queries'
import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Ad } from '@/types/api'

const AUTO_MS = 5500
const BADGE_LABELS = ['عرض حصري', 'لفترة محدودة', 'تخفيض مميز', 'وصل حديثاً']

export function AdsCarousel() {
  const { t, i18n } = useTranslation()
  const { data: ads, isLoading } = useAds()
  const isRtl = i18n.language.startsWith('ar')
  const [paused, setPaused] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: isRtl ? 'rtl' : 'ltr' })

  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect) }
  }, [emblaApi, onSelect])

  // Manual autoplay
  const timerRef = useRef<number | null>(null)
  useEffect(() => {
    if (!emblaApi || !ads || ads.length <= 1 || paused) return
    timerRef.current = window.setInterval(() => emblaApi.scrollNext(), AUTO_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [emblaApi, ads, paused])

  if (isLoading) {
    return <Skeleton className="mx-4 h-44 rounded-2xl md:mx-8 md:h-64 lg:h-80" />
  }

  if (!ads || ads.length === 0) return null

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div
      className="group relative mx-4 md:mx-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {ads.map((ad, idx) => (
            <AdSlide
              key={ad.id}
              ad={ad}
              index={idx}
              isActive={idx === selectedIndex}
              badgeLabel={BADGE_LABELS[idx % BADGE_LABELS.length]}
              isRtl={isRtl}
            />
          ))}
        </div>
      </div>

      {/* Arrows — appear on hover */}
      {ads.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={t('ads.prev')}
            className="absolute inset-s-3 top-1/2 z-20 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/55 hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <PrevIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={t('ads.next')}
            className="absolute inset-e-3 top-1/2 z-20 -translate-y-1/2 inline-flex size-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/55 hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <NextIcon className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={t('ads.goToSlide', { index: i + 1 })}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === selectedIndex
                    ? 'h-2.5 w-7 bg-primary shadow-md'
                    : 'size-2.5 bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AdSlide({
  ad,
  index,
  isActive,
  badgeLabel,
  isRtl,
}: {
  ad: Ad
  index: number
  isActive: boolean
  badgeLabel: string
  isRtl: boolean
}) {
  const { t } = useTranslation()
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const hasLink = ad.link?.length > 0
  const isFirst = index === 0

  const Wrapper = hasLink ? 'a' : 'div'
  const wrapperProps = hasLink
    ? { href: ad.link, target: '_blank', rel: 'noopener noreferrer', tabIndex: isActive ? 0 : -1 }
    : { role: 'group', 'aria-label': ad.title, 'aria-hidden': !isActive }

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="group relative min-w-full shrink-0 overflow-hidden bg-neutral-900"
      style={{ height: 'clamp(180px, 28vw, 380px)' }}
    >
      {/* Background media */}
      {ad.media_type === 'video' ? (
        <video
          src={fileUrl}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          autoPlay muted loop playsInline
          preload={isFirst ? 'auto' : 'metadata'}
        />
      ) : (
        <img
          src={fileUrl}
          alt={ad.title || ''}
          loading={isFirst ? 'eager' : 'lazy'}
          fetchPriority={isFirst ? 'high' : 'low'}
          decoding={isFirst ? 'sync' : 'async'}
          width={1200}
          height={450}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={{ willChange: 'transform' }}
        />
      )}

      {/* Gradient overlay — from start (right in RTL) to transparent */}
      <div className={cn(
        'absolute inset-0',
        isRtl
          ? 'bg-linear-to-l from-black/75 via-black/40 to-transparent'
          : 'bg-linear-to-r from-black/75 via-black/40 to-transparent',
      )} />
      {/* Bottom gradient for dots readability */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/50 to-transparent" />

      {/* Text content */}
      {ad.title && isActive && (
        <div className={cn(
          'absolute inset-y-0 flex flex-col justify-center gap-3 px-6 md:px-10',
          isRtl ? 'right-0 items-start text-start' : 'left-0 items-start text-start',
          'max-w-xs sm:max-w-sm md:max-w-md',
        )}>
          {/* Badge */}
          <AnimatePresence>
            <motion.span
              key={`badge-${ad.id}`}
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md"
            >
              {badgeLabel}
            </motion.span>
          </AnimatePresence>

          {/* Title */}
          <motion.h3
            key={`title-${ad.id}`}
            initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl font-extrabold leading-snug text-white drop-shadow-md sm:text-2xl md:text-3xl"
          >
            {ad.title}
          </motion.h3>

          {/* CTA */}
          {hasLink && (
            <motion.span
              key={`cta-${ad.id}`}
              initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 sm:w-auto sm:justify-start"
            >
              {t('ads.shopNow', { defaultValue: 'تسوق الآن' })}
              <ExternalLink className="size-3.5" />
            </motion.span>
          )}
        </div>
      )}
    </Wrapper>
  )
}
