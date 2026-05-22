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
 * Always uses English (Western) digits regardless of UI language.
 */
export function formatPrice(price: string | number, _lang?: string): string {
  const n = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(n)) return String(price)
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(n)
}

/** Format an ISO date string — month name follows UI language, digits always English. */
export function formatDate(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(lang.startsWith('ar') ? 'ar-SY' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      numberingSystem: 'latn',
    } as Intl.DateTimeFormatOptions).format(d)
  } catch {
    return iso
  }
}

/** Format a date+time — digits always English. */
export function formatDateTime(iso: string, lang: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(lang.startsWith('ar') ? 'ar-SY' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      numberingSystem: 'latn',
    } as Intl.DateTimeFormatOptions).format(d)
  } catch {
    return iso
  }
}
