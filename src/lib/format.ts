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

/**
 * Compact numeric date + 12-hour time, e.g. "9/9/2026 5:55pm".
 *
 * Day/month/year, the order used locally. Render it inside `dir="ltr"` —
 * in an RTL paragraph the bidi algorithm would otherwise put the clock
 * before the date.
 */
export function formatDateTimeShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hours = d.getHours()
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const suffix = hours < 12 ? 'am' : 'pm'
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${hour12}:${minutes}${suffix}`
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
