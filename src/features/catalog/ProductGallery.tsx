import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/api'

interface ProductGalleryProps {
  images: ProductImage[]
  alt: string
  lang?: string
}

export function ProductGallery({ images, alt, lang = 'ar' }: ProductGalleryProps) {
  const ordered = [...images].sort((a, b) =>
    a.is_main === b.is_main ? a.id - b.id : a.is_main ? -1 : 1,
  )
  const [activeIdx, setActiveIdx] = useState(0)
  const active = ordered[activeIdx]
  const activeUrl = resolveMediaUrl(active?.image)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={(lang.startsWith('ar') ? active?.alt_text_ar : active?.alt_text) || alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-12" />
          </div>
        )}
      </div>

      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {ordered.map((img, idx) => {
            const url = resolveMediaUrl(img.image)
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`${alt} ${idx + 1}`}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md border bg-muted transition-all',
                  idx === activeIdx
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-border hover:border-primary/50',
                )}
              >
                {url && (
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
