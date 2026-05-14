import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { useAds } from '@/features/ads/queries'
import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Ad } from '@/types/api'

const AUTO_ADVANCE_MS = 5500

export function AdsCarousel() {
  const { t, i18n } = useTranslation()
  const { data: ads, isLoading } = useAds()
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isRtl = i18n.language.startsWith('ar')
  const Prev = isRtl ? ChevronRight : ChevronLeft
  const Next = isRtl ? ChevronLeft : ChevronRight

  // Auto-advance.
  useEffect(() => {
    if (!ads || ads.length <= 1 || paused) return
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % ads.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [ads, paused])

  // Pause when the tab is hidden — don't burn cycles on offscreen videos.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () =>
      document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Clamp index if ads change.
  useEffect(() => {
    if (ads && activeIdx >= ads.length) setActiveIdx(0)
  }, [ads, activeIdx])

  if (isLoading) {
    return (
      <Skeleton className="aspect-[16/6] w-full rounded-2xl md:aspect-[16/5]" />
    )
  }

  if (!ads || ads.length === 0) return null

  const goPrev = () =>
    setActiveIdx((i) => (i - 1 + ads.length) % ads.length)
  const goNext = () => setActiveIdx((i) => (i + 1) % ads.length)

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t('ads.title')}
    >
      <div
        dir="ltr"
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
        aria-live="polite"
      >
        {ads.map((ad, idx) => (
          <AdSlide
            key={ad.id}
            ad={ad}
            isActive={idx === activeIdx}
            label={t('ads.slideOf', { current: idx + 1, total: ads.length })}
          />
        ))}
      </div>

      {ads.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t('ads.prev')}
            className="absolute start-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-background hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Prev className="size-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t('ads.next')}
            className="absolute end-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-background hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Next className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={t('ads.goToSlide', { index: i + 1 })}
                aria-current={i === activeIdx ? 'true' : undefined}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === activeIdx
                    ? 'w-7 bg-primary'
                    : 'w-2 bg-white/70 hover:bg-white/90',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

interface AdSlideProps {
  ad: Ad
  isActive: boolean
  label: string
}

function AdSlide({ ad, isActive, label }: AdSlideProps) {
  const fileUrl = resolveMediaUrl(ad.file) ?? ''
  const hasLink = ad.link?.length > 0

  const Inner = (
    <>
      {ad.media_type === 'video' ? (
        <video
          src={fileUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={fileUrl}
          alt={ad.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {ad.title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-5 pt-12 pb-6 text-white">
          <h3 className="text-base font-semibold leading-tight md:text-lg">
            {ad.title}
          </h3>
        </div>
      )}

      {hasLink && (
        <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
          <ExternalLink className="size-3" />
        </span>
      )}
    </>
  )

  const wrapperClasses =
    'relative aspect-[16/6] w-full shrink-0 overflow-hidden bg-muted md:aspect-[16/5]'

  if (hasLink) {
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        aria-hidden={!isActive}
        tabIndex={isActive ? 0 : -1}
        className={wrapperClasses}
      >
        {Inner}
      </a>
    )
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-hidden={!isActive}
      className={wrapperClasses}
    >
      {Inner}
    </div>
  )
}
