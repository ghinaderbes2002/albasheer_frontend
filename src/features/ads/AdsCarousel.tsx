import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX } from 'lucide-react'
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
  const [selectedIndex, setSelectedIndex] = useState(0)

  // align:'center' + no containScroll → slides snap to center & peek shows
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isRtl ? 'rtl' : 'ltr',
    align: 'center',
    containScroll: false,
  })

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
    return <Skeleton className="mx-4 h-44 rounded-3xl md:mx-8 md:h-64 lg:h-80" />
  }

  if (!ads || ads.length === 0) return null

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const hasManySlides = ads.length > 1

  return (
    <div
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Embla viewport — overflow-hidden but slides extend via 88% width */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 md:gap-4">
          {ads.map((ad, idx) => (
            <AdSlide
              key={ad.id}
              ad={ad}
              index={idx}
              isActive={idx === selectedIndex}
              badgeLabel={BADGE_LABELS[idx % BADGE_LABELS.length]}
              isRtl={isRtl}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {hasManySlides && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={t('ads.prev')}
            className="absolute inset-s-5 top-1/2 z-20 -translate-y-1/2 hidden size-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:inline-flex"
          >
            <PrevIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={t('ads.next')}
            className="absolute inset-e-5 top-1/2 z-20 -translate-y-1/2 hidden size-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary hover:scale-110 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:inline-flex"
          >
            <NextIcon className="size-5" />
          </button>

          {/* Dot indicators */}
          <div className="mt-4 flex justify-center gap-2">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={t('ads.goToSlide', { index: i + 1 })}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === selectedIndex
                    ? 'h-2 w-6 bg-primary'
                    : 'size-2 bg-foreground/20 hover:bg-foreground/40',
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
  t,
}: {
  ad: Ad
  index: number
  isActive: boolean
  badgeLabel: string
  isRtl: boolean
  t: ReturnType<typeof useTranslation>['t']
}) {
  const [muted, setMuted] = useState(true)
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const hasLink = ad.link?.length > 0
  const isFirst = index === 0
  const isVideo = ad.media_type === 'video'

  const Wrapper = hasLink ? 'a' : 'div'
  const wrapperProps = hasLink
    ? { href: ad.link, target: '_blank', rel: 'noopener noreferrer', tabIndex: isActive ? 0 : -1 }
    : { role: 'group', 'aria-label': ad.title }

  return (
    // 88% width on mobile, 85% on large screens — shows ~6-7% of adjacent slides
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.93,
        opacity: isActive ? 1 : 0.55,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: '0 0 88%', minWidth: 0 }}
      className="relative overflow-hidden rounded-3xl bg-neutral-900"
    >
      <Wrapper
        {...(wrapperProps as any)}
        className="group block"
        style={{ height: 'clamp(190px, 30vw, 400px)' }}
      >
        {/* Media */}
        {isVideo ? (
          <video
            src={fileUrl}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay muted={muted} loop playsInline
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ willChange: 'transform' }}
          />
        )}

        {/* Dark vignette from bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        {/* Glass text card — bottom of slide */}
        {ad.title && isActive && (
          <div
            className={cn(
              'absolute bottom-0 inset-x-0 px-5 pb-5 pt-8',
              'flex items-end justify-between gap-4',
            )}
          >
            {/* Left/start: badge + title */}
            <div className={cn('flex flex-col gap-2', isRtl ? 'items-start' : 'items-start')}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`badge-${ad.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-primary-foreground"
                >
                  {badgeLabel}
                </motion.span>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.h3
                  key={`title-${ad.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-[65%] text-lg font-extrabold leading-snug text-white drop-shadow sm:text-xl md:text-2xl"
                >
                  {ad.title}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Right/end: CTA or mute */}
            <div className="flex shrink-0 flex-col items-end gap-2">
              {/* Mute toggle — video only */}
              {isVideo && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMuted(v => !v) }}
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                  aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
                >
                  {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              )}

              {hasLink && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`cta-${ad.id}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
                  >
                    {t('ads.shopNow', { defaultValue: 'تسوق الآن' })}
                    <ExternalLink className="size-3" />
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </Wrapper>
    </motion.div>
  )
}
