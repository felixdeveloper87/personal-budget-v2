/**
 * Brand copy & naming — one place to keep voice consistent across header,
 * landing page and footer. Edit here, the whole product follows.
 */

const TAGLINE = 'Clarity for your money'
const _taglineParts = TAGLINE.split(' ')

export const BRAND = {
  /* ---------------------------------------------------------------------- */
  /* Names                                                                  */
  /* ---------------------------------------------------------------------- */

  /** Full name for screen readers, titles, and legal */
  nameFull: 'Personal Budget',
  /** Wordmark: first word calm, second word carries accent (see Logo) */
  nameFirst: 'Personal',
  nameSecond: 'Budget',

  /* ---------------------------------------------------------------------- */
  /* Tagline (the source of truth)                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * One-liner: concrete benefit, not a generic slogan.
   * Used as-is in Logo subtitle and Footer; split into primary + accent
   * for the Hero headline gradient.
   */
  tagline: TAGLINE,

  /** Tagline minus the last word — `"Clarity for your"` */
  taglinePrimary: _taglineParts.slice(0, -1).join(' '),

  /** Last word of the tagline — `"money"` (gets the gradient in Hero) */
  taglineAccent: _taglineParts[_taglineParts.length - 1],

  /* ---------------------------------------------------------------------- */
  /* CTA labels — same intent, voice tuned per surface                      */
  /* ---------------------------------------------------------------------- */

  cta: {
    /** Header (sm+) — minimal verb */
    headerShort: 'Get Started',
    /** Header (lg+) — slightly longer when there's room */
    headerLong: 'Get Started Free',
    /** Header (mobile / not signed-in) — auth-first wording */
    headerCompact: 'Sign in',
    /** Hero — conversational, pairs with bullets */
    hero: 'Get started — it’s free',
    /** Hero secondary — anchors to product preview */
    heroSecondary: 'See the dashboard',
    /** Final / closing CTA — imperative, short */
    final: 'Start free',
  },

  /* ---------------------------------------------------------------------- */
  /* Atomic promises — pick subsets per surface to keep voice unified        */
  /* ---------------------------------------------------------------------- */

  promises: {
    noCard: 'No credit card',
    private: 'Private by default',
    fastSetup: 'Set up in under a minute',
    exportAnyTime: 'Export any time',
    free: 'Free, no asterisk',
  },
} as const

export type Brand = typeof BRAND

/**
 * Pre-composed promise sets — addresses the "fragmented bullets" problem
 * (Hero said "No credit card", FinalCTA said "No card", etc).
 * Both surfaces now agree on wording while still being free to slice.
 */
export const BRAND_PROMISES = {
  hero: [BRAND.promises.noCard, BRAND.promises.private, BRAND.promises.fastSetup],
  finalCta: [BRAND.promises.noCard, BRAND.promises.private, BRAND.promises.exportAnyTime],
} as const
