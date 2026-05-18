import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  /**
   * `default` — solid wordmark (uses parent text color). Best on light surfaces.
   * `shimmer` — gold metallic gradient with a slow shimmer. Best on dark surfaces.
   */
  tone?: 'default' | 'shimmer'
}

/**
 * Brand mark — gold "B" badge + bilingual wordmark.
 */
export function Logo({
  className,
  showText = true,
  tone = 'default',
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/images/logo_al_basheer-removebg-preview.png"
        alt="البشير"
        className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
      />
      {showText && (
        <div className="leading-tight text-start">
          <div
            className={cn(
              'text-lg font-extrabold tracking-tight',
              tone === 'shimmer' ? 'logo-shimmer' : 'text-foreground',
            )}
          >
            البشير
          </div>
          <div className="text-[10px] font-medium text-foreground">
            لتجارة الأدوات المنزلية
          </div>
        </div>
      )}
    </div>
  )
}
