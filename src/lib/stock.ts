/**
 * Stock helpers.
 *
 * The backend replaced `Product.in_stock` (boolean) with `stock_quantity`
 * (a real count) on 2026-08-10. Public listings now hide anything with
 * `stock_quantity <= 0` outright, so staff screens are the only place a
 * zero/low count is visible.
 */

/** Matches the default `threshold` of the backend low-stock report. */
export const LOW_STOCK_THRESHOLD = 5

export type StockLevel = 'out' | 'low' | 'ok'

export function stockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'ok'
}

/** Badge classes per level — shared by the admin and accountant screens. */
export const stockBadgeClass: Record<StockLevel, string> = {
  out: 'bg-gray-100 text-gray-500',
  low: 'bg-amber-100 text-amber-700',
  ok: 'bg-blue-100 text-blue-700',
}
