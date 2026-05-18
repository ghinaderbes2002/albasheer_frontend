import * as React from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('relative overflow-hidden rounded-md bg-muted', className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease_infinite] bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
    </div>
  )
}

export { Skeleton }
