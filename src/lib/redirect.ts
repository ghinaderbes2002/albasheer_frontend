import type { Location } from 'react-router-dom'

/**
 * Helpers for resuming an interrupted navigation after login.
 *
 * `ProtectedRoute` stashes the whole `Location` it turned away — path, query
 * and the state that navigation was carrying — and every hop of the auth
 * chain (login → verify → complete-profile) passes it along untouched, so
 * the reader lands back exactly where they were rather than on the home
 * page. Carrying the state matters: "Buy now" puts the chosen item there,
 * and dropping it would empty the checkout.
 */

export interface FromState {
  from?: Location
}

/** Path (with query and hash) to resume, or `null` if there is nothing to resume. */
export function fromPath(state: unknown): string | null {
  const from = (state as FromState | null)?.from
  if (!from?.pathname) return null
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

/** The state the interrupted navigation was carrying, if any. */
export function fromState(state: unknown): unknown {
  return (state as FromState | null)?.from?.state ?? undefined
}

/** Re-wraps the stashed location for the next hop in the auth chain. */
export function carryFrom(state: unknown): FromState | undefined {
  const from = (state as FromState | null)?.from
  return from ? { from } : undefined
}
