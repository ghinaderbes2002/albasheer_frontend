/**
 * ─────────────────────────────────────────────────────────────────────
 *  Social media links
 * ─────────────────────────────────────────────────────────────────────
 *
 *  Paste your real URLs here once you have them. Any link left as an
 *  empty string `''` will be **hidden** from the footer automatically,
 *  so you can release with only the channels that are actually live.
 *
 *  Examples:
 *    instagram: 'https://instagram.com/albasheer'
 *    facebook : 'https://facebook.com/albasheer'
 *    whatsapp : 'https://wa.me/963999999999'   // E.164 phone, no '+'
 */
export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/albasheer',
  facebook: 'https://facebook.com/albasheer',
  whatsapp: 'https://wa.me/963999999999',
} as const

export type SocialKey = keyof typeof SOCIAL_LINKS
