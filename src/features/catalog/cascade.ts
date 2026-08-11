import type { CascadeOptions } from '@/hooks/useCascade'

/**
 * Reveal pace for product grids.
 *
 * Deliberately quicker than the categories page: product grids are 3–4
 * columns of smaller cards, so the same pacing there would drag.
 */
export const PRODUCT_CASCADE = {
  queue: { stagger: 65, batchGap: 450 } satisfies CascadeOptions,
  duration: 520,
  distance: 24,
}
