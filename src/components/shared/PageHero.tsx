import { useState } from 'react'

import { cn } from '@/lib/utils'

interface PageHeroProps {
  title: string
  subtitle?: string
  image?: string
  height?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights = {
  sm: 'h-48 md:h-56',
  md: 'h-56 md:h-72',
  lg: 'h-72 md:h-96',
}

export function PageHero({
  title,
  subtitle,
  image,
  height = 'md',
  className,
}: PageHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden',
        heights[height],
        // Dark ground under the photo. Without it the black/50 overlay sits
        // on the light page background, so the white heading renders on pale
        // grey until the (remote) image arrives — a visible flash.
        image && 'bg-ink-900',
        className,
      )}
    >
      {/* Background image — scaled up slightly so blur edges don't show */}
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          width={1200}
          height={400}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full scale-105 object-cover blur-sm transition-opacity duration-500 motion-reduce:transition-none',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0',
          image
            ? 'bg-black/50'
            : 'bg-linear-to-br from-primary/20 via-background to-background',
        )}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1
          className={cn(
            'text-3xl font-bold md:text-4xl lg:text-5xl',
            image ? 'text-white drop-shadow-md' : 'text-foreground',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'mt-3 text-sm md:text-base',
              image ? 'text-white/80' : 'text-muted-foreground',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
