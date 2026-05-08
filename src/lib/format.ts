/**
 * Pick the localized variant of a bilingual field pair from the backend.
 * Backend always sends `field` (English) and `field_ar` (Arabic).
 */
export function pickLang<T>(en: T | null | undefined, ar: T | null | undefined, lang: string): T {
  if (lang.startsWith('ar')) return (ar ?? en) as T
  return (en ?? ar) as T
}

/**
 * Format a price coming from the API (always a string like "1500000.00").
 * Locale-aware grouping; currency symbol comes from i18n (`common.currency`).
 */
export function formatPrice(price: string | number, lang: string): string {
  const n = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(n)) return String(price)
  const locale = lang.startsWith('ar') ? 'ar-SY' : 'en-US'
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(n)
}

/** Format an ISO date string in the user's language. */
export function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    const locale = lang.startsWith('ar') ? 'ar-SY' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return iso
  }
}

/** Format a date+time. */
export function formatDateTime(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    const locale = lang.startsWith('ar') ? 'ar-SY' : 'en-US'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso
  }
}
