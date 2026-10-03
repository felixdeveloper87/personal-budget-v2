/** Eyebrow casing via a CSS var so a page (the Nubank-style dashboard) can switch it off.
 * Chakra types textTransform as a literal union, so the var is typed as its default. */
export const EYEBROW_CASE = 'var(--pb-eyebrow-case, uppercase)' as unknown as 'uppercase'
