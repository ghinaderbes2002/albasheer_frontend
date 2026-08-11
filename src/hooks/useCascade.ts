import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered cascade reveal, shared by the grids that show one card
 * after another (categories, product grids).
 *
 * Pair `useCascade` (once, in the list) with `CascadeItem` (per card).
 */

export interface CascadeOptions {
  /** Milliseconds between two consecutive items. */
  stagger?: number
  /** Items revealed further apart than this start a fresh cascade. */
  batchGap?: number
}

export function prefersReducedMotion() {
  return (
    typeof window === 'undefined' ||
    typeof IntersectionObserver === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Hands out the delay for the next item to reveal.
 *
 * The delay comes from the *order items actually become visible*, not their
 * index — so a screenful that appears at once still cascades one by one,
 * and an item scrolled to on its own doesn't sit waiting behind absent
 * predecessors. A pause resets the queue so later screenfuls start over
 * instead of accumulating an ever-growing delay.
 */
export function useCascade({ stagger = 120, batchGap = 600 }: CascadeOptions = {}) {
  const queue = useRef({ position: 0, lastAt: 0 })

  return useCallback(() => {
    const now = performance.now()
    if (now - queue.current.lastAt > batchGap) queue.current.position = 0
    queue.current.lastAt = now
    return queue.current.position++ * stagger
  }, [stagger, batchGap])
}

/**
 * Fires once, the first time the element scrolls into view, and reports the
 * cascade delay assigned to it.
 *
 * Starts already revealed when motion is unwanted or the observer is
 * unavailable, so content is never gated behind an animation that will not
 * run.
 */
export function useRevealOnScroll<T extends HTMLElement>(nextDelay: () => number) {
  const ref = useRef<T>(null)
  const [reveal, setReveal] = useState(() => ({
    shown: prefersReducedMotion(),
    delay: 0,
  }))

  useEffect(() => {
    const el = ref.current
    if (!el || reveal.shown) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        // Delay and visibility flip in the same render, so the transition
        // starts already carrying its slot in the cascade.
        setReveal({ shown: true, delay: nextDelay() })
        observer.disconnect()
      },
      // Trigger a little before the item reaches the bottom edge.
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reveal.shown, nextDelay])

  return { ref, ...reveal }
}
