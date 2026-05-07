import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
}

/**
 * Brand mark — gold "B" badge on dark surface, with optional bilingual wordmark.
 * Replace the badge with the real logo image once `src/assets/logo.png` is added.
 */
export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary text-lg font-extrabold ring-2 ring-primary/40">
        B
      </div>
      {showText && (
        <div className="leading-tight text-start">
          <div className="text-base font-bold text-foreground">البشير</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Al Basheer
          </div>
        </div>
      )}
    </div>
  )
}
