import { useRevealOnScroll } from '@/hooks/useCascade'

interface CascadeItemProps {
  /** The queue from `useCascade()` — shared by every item in one list. */
  nextDelay: () => number
  /** `li` when the list is a real `<ul>`, `div` otherwise. */
  as?: 'div' | 'li'
  /** Length of each item's own fade/rise, in ms. */
  duration?: number
  /** How far the item rises from, in px. */
  distance?: number
  className?: string
  children: React.ReactNode
}

/**
 * Wraps one card so it fades and rises into place when scrolled to, in
 * sequence with its siblings.
 *
 * Animatable values are inline rather than utility classes so a list can
 * tune its own pace without minting a new arbitrary class each time.
 */
export function CascadeItem({
  nextDelay,
  as: Tag = 'div',
  duration = 700,
  distance = 32,
  className,
  children,
}: CascadeItemProps) {
  const { ref, shown, delay } = useRevealOnScroll<HTMLElement>(nextDelay)

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={className}
      style={{
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${distance}px)`,
      }}
    >
      {children}
    </Tag>
  )
}
