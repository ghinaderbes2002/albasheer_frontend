import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, MapPin, Navigation, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
import type { Branch } from '@/types/api'

interface BranchCardProps {
  branch: Branch
}

export function BranchCard({ branch }: BranchCardProps) {
  const { t } = useTranslation()
  const [locating, setLocating] = useState(false)

  function handleNavigate() {
    const destination = encodeURIComponent(
      branch.maps_url ? branch.maps_url : `${branch.address}, ${branch.city}, Syria`,
    )

    if (!navigator.geolocation) {
      // No geolocation support — open maps without origin
      window.open(branch.maps_url || `https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const { latitude, longitude } = pos.coords
        const dest = branch.maps_url
          ? encodeURIComponent(branch.maps_url)
          : encodeURIComponent(`${branch.address}, ${branch.city}, Syria`)
        window.open(
          `https://www.google.com/maps/dir/${latitude},${longitude}/${dest}`,
          '_blank',
        )
      },
      () => {
        setLocating(false)
        // Permission denied or error — open maps without origin
        toast(t('branches.locationDenied'), { icon: '📍' })
        window.open(
          branch.maps_url || `https://www.google.com/maps/search/?api=1&query=${destination}`,
          '_blank',
        )
      },
      { timeout: 8000 },
    )
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8">
      {/* Gold accent bar */}
      <div className="h-1 bg-linear-to-r from-brand-400 to-brand-600" />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-card-foreground leading-tight">
            {branch.name}
          </h3>
          {!branch.is_active && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {t('branches.inactive')}
            </Badge>
          )}
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-foreground">{branch.city}</span>
              {' — '}
              {branch.address}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {branch.phone && (
              <a
                href={`tel:${branch.phone}`}
                dir="ltr"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Phone className="size-3.5 shrink-0" />
                {branch.phone}
              </a>
            )}
            <button
              type="button"
              onClick={handleNavigate}
              disabled={locating}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80 hover:border-primary/30 disabled:opacity-60"
            >
              {locating
                ? <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                : <Navigation className="size-3.5 shrink-0 text-primary" />
              }
              {locating ? t('branches.locating') : t('branches.navigate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
