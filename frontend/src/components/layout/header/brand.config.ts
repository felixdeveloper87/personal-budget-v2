/**
 * Brand copy & naming — one place to keep voice consistent (header, meta, future footer).
 */
export const BRAND = {
  /** Full name for screen readers, titles, and legal */
  nameFull: 'Personal Budget',
  /** Wordmark: first word calm, second word carries accent (see Logo) */
  nameFirst: 'Personal',
  nameSecond: 'Budget',
  /**
   * One-liner: concrete benefit, not a generic slogan.
   * (Replace anytime — keep it short; shows lg+ in header)
   */
  tagline: 'Clarity for your money',
} as const

export type Brand = typeof BRAND
