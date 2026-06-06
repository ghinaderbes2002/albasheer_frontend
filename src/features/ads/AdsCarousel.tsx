import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Volume2, VolumeX, X, Maximize2 } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAds } from '@/features/ads/queries'
import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Ad } from '@/types/api'

const AUTO_MS = 5500
const BADGE_LABELS = ['عرض حصري', 'لفترة محدودة', 'تخفيض مميز', 'وصل حديثاً']

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const isVideo = ad.media_type === 'video'
  const hasLink = ad.link?.length > 0

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 p-4"
        onClick={onClose}
      >
        {/* Media container */}
        <motion.div
          key="lightbox-content"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-h-[90dvh] max-w-5xl w-full overflow-hidden rounded-2xl bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={fileUrl}
              className="max-h-[85dvh] w-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={fileUrl}
              alt={ad.title || ''}
              className="max-h-[85dvh] w-full object-contain"
            />
          )}

          {/* Title bar at bottom */}
          {(ad.title || hasLink) && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/70 px-4 py-3 backdrop-blur-sm">
              {ad.title && (
                <p className="line-clamp-1 text-sm font-semibold text-white">{ad.title}</p>
              )}
              {hasLink && (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  زيارة الرابط
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}
        </motion.div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          aria-label="إغلاق"
        >
          <X className="size-5" />
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdsCarousel
// ─────────────────────────────────────────────────────────────────────────────
export function AdsCarousel() {
  const { t, i18n } = useTranslation()
  const { data: ads, isLoading } = useAds()
  const isRtl = i18n.language.startsWith('ar')
  const [paused, setPaused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxAd, setLightboxAd] = useState<Ad | null>(null)

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
    <>
      <div
        className="group relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
                onExpand={() => setLightboxAd(ad)}
              />
            ))}
          </div>
        </div>

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

      {/* Lightbox */}
      {lightboxAd && <Lightbox ad={lightboxAd} onClose={() => setLightboxAd(null)} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdSlide
// ─────────────────────────────────────────────────────────────────────────────
function AdSlide({
  ad,
  index,
  isActive,
  badgeLabel,
  isRtl,
  t,
  onExpand,
}: {
  ad: Ad
  index: number
  isActive: boolean
  badgeLabel: string
  isRtl: boolean
  t: ReturnType<typeof useTranslation>['t']
  onExpand: () => void
}) {
  const [muted, setMuted] = useState(true)
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const hasLink = ad.link?.length > 0
  const isFirst = index === 0
  const isVideo = ad.media_type === 'video'

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.93,
        opacity: isActive ? 1 : 0.55,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: '0 0 88%', minWidth: 0, height: 'clamp(190px, 30vw, 400px)' }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-neutral-900"
      onClick={onExpand}
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

      {/* Expand hint icon — top corner */}
      <div className="absolute end-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        <Maximize2 className="size-3.5" />
      </div>

      {/* Dark vignette from bottom */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Glass text card */}
      {ad.title && isActive && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 pt-8">
          <div className="flex flex-col gap-2">
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

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isVideo && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMuted(v => !v) }}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
            )}

            {hasLink && (
              <AnimatePresence mode="wait">
                <motion.a
                  key={`cta-${ad.id}`}
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
                >
                  {t('ads.shopNow', { defaultValue: 'تسوق الآن' })}
                  <ExternalLink className="size-3" />
                </motion.a>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
