import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAds } from '@/features/ads/queries'
import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Ad } from '@/types/api'

const AUTO_ADVANCE_MS = 6000

export function AdsCarousel() {
  const { t, i18n } = useTranslation()
  const { data: ads, isLoading } = useAds()
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const progressRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const isRtl = i18n.language.startsWith('ar')
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const LinkArrow = isRtl ? ArrowLeft : ArrowRight

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx)
    setProgress(0)
    startTimeRef.current = Date.now()
  }, [])

  const goPrev = useCallback(() => {
    if (!ads) return
    goTo((activeIdx - 1 + ads.length) % ads.length)
  }, [ads, activeIdx, goTo])

  const goNext = useCallback(() => {
    if (!ads) return
    goTo((activeIdx + 1) % ads.length)
  }, [ads, activeIdx, goTo])

  // Progress bar animation
  useEffect(() => {
    if (!ads || ads.length <= 1 || paused) {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
      return
    }
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick)
      }
    }
    progressRef.current = requestAnimationFrame(tick)
    return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current) }
  }, [ads, paused, activeIdx])

  // Auto-advance
  useEffect(() => {
    if (!ads || ads.length <= 1 || paused) return
    intervalRef.current = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % ads.length)
      setProgress(0)
      startTimeRef.current = Date.now()
    }, AUTO_ADVANCE_MS)
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current) }
  }, [ads, paused])

  // Pause on hidden tab
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Clamp index
  useEffect(() => {
    if (ads && activeIdx >= ads.length) goTo(0)
  }, [ads, activeIdx, goTo])

  if (isLoading) {
    return <Skeleton className="h-52 w-full rounded-2xl md:h-72 lg:h-80" />
  }

  if (!ads || ads.length === 0) return null

  return (
    <section
      className="relative overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('ads.title')}
    >
      {/* Slides */}
      <div className="relative h-52 md:h-72 lg:h-80">
        {ads.map((ad, idx) => (
          <AdSlide
            key={ad.id}
            ad={ad}
            isActive={idx === activeIdx}
            isFirst={idx === 0}
            label={t('ads.slideOf', { current: idx + 1, total: ads.length })}
            LinkArrow={LinkArrow}
          />
        ))}
      </div>

      {/* Progress bar */}
      {ads.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
          <div
            className="h-full bg-primary transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Navigation */}
      {ads.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('ads.prev')}
            className="absolute start-3 top-1/2 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-[background-color,transform] hover:bg-black/65 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <PrevIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('ads.next')}
            className="absolute end-3 top-1/2 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-[background-color,transform] hover:bg-black/65 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <NextIcon className="size-5" />
          </button>

          {/* Dot indicators + counter */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              {ads.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={t('ads.goToSlide', { index: i + 1 })}
                  aria-current={i === activeIdx ? 'true' : undefined}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === activeIdx
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80',
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-white/70 select-none">
              {activeIdx + 1}/{ads.length}
            </span>
          </div>
        </>
      )}
    </section>
  )
}

interface AdSlideProps {
  ad: Ad
  isActive: boolean
  isFirst: boolean
  label: string
  LinkArrow: React.ElementType
}

function AdSlide({ ad, isActive, isFirst, label, LinkArrow }: AdSlideProps) {
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const hasLink = ad.link?.length > 0

  const Content = (
    <>
      {/* Media */}
      {ad.media_type === 'video' ? (
        <video
          src={fileUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
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
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />

      {/* Text content */}
      {ad.title && (
        <div className="absolute inset-x-0 bottom-10 px-5 md:bottom-12 md:px-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary/90">
            عرض حصري
          </p>
          <h3 className="text-lg font-extrabold leading-snug text-white drop-shadow-sm md:text-2xl lg:text-3xl">
            {ad.title}
          </h3>
          {hasLink && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
              اعرف أكثر
              <LinkArrow className="size-3" />
            </span>
          )}
        </div>
      )}
    </>
  )

  const base = cn(
    'absolute inset-0 transition-opacity duration-700',
    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0',
  )

  if (hasLink) {
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        tabIndex={isActive ? 0 : -1}
        className={base}
      >
        {Content}
      </a>
    )
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-hidden={!isActive}
      className={base}
    >
      {Content}
    </div>
  )
}
