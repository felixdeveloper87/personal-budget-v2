/**
 * Landing v3 — "Editorial · guilloché" edition.
 * Deep ink-green + luminous jade + giant editorial serif.
 * All copy is English. Ported from docs/personal-budget-landing-v3-editorial.md.
 */

export const NAV_LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'manifesto', label: 'Manifesto' },
  { id: 'voices', label: 'Voices' },
] as const

export const HERO = {
  /** Massive serif headline. The accent word renders in jade italic. */
  line1: 'Clarity',
  line2is: 'is',
  line2accent: 'wealth.',
  subtitle:
    'Personal Budget turns a thousand small money decisions into one calm, honest picture — your transactions, budgets and trends, plus shared bills when life is shared.',
  primaryCta: 'Start free',
  secondaryCta: 'See it move',
} as const

/** Ticker stats — marquee that skews with scroll velocity. */
export const TICKER = [
  '£0 forever',
  '60s to set up',
  '100% exportable',
  '0 trackers',
  '⌘K search',
  '∞ categories',
  'Shared bills, settled',
  'Weekly home rota',
  'Dark mode that ships',
  'Private by default',
] as const

/** Scroll-scrubbed mockup — small data that fills its panels. */
export const MOCKUP = {
  balanceLabel: 'Available balance',
  balance: '£2,287.20',
  delta: '+£540 this week',
  /** Live rows that arrive inside the mockup. */
  feed: [
    { label: 'Salary · April', amount: '+£3,200', tone: 'jade' as const },
    { label: 'Groceries · Continente', amount: '−£42.80', tone: 'muted' as const },
    { label: 'Invoice · Side project', amount: '+£540.00', tone: 'jade' as const },
    { label: 'Spotify · Family', amount: '−£15.99', tone: 'muted' as const },
  ],
  budgets: [
    { label: 'Essentials', value: 0.62 },
    { label: 'Lifestyle', value: 0.41 },
    { label: 'Savings', value: 0.8 },
  ],
} as const

/** Bento grid — six cells with functional micro-demos. */
export const BENTO = {
  searchQuery: 'coffee',
  searchResults: ['Coffee · Starbucks', 'Coffee beans · Lidl', 'Coffee machine · Amazon'],
  searchMeta: '3 results · 41ms',
  recurringMonths: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
  exportFormats: ['.csv', '.pdf', '.xlsx'],
} as const

/** Compact Household mention inside the wider product feature grid. */
export const HOUSEHOLD = {
  title: 'Household',
  hint: 'shared bills + home duties',
  bill: {
    label: 'Electricity bill',
    meta: 'Paid by Leandro · split 5 ways',
    amount: '£20 each',
  },
  balance: {
    label: 'Who owes whom',
    value: 'Aisha → Leandro · £10',
  },
  cleaning: {
    label: 'Cleaning this week',
    person: 'Tom',
    dates: '4–10 Aug',
  },
  footer: 'Bills · balances · repayments · private proofs · weekly rota',
} as const

/**
 * Manifesto — scroll-lit text. Words wrapped in *asterisks* become keywords
 * that ignite in jade italic as the section scrolls.
 */
export const MANIFESTO =
  'Money is not the goal. *Clarity* is. ' +
  'When you *see* every flow, anxiety becomes *arithmetic*. ' +
  'One calm, honest *picture* — kept sharp.'

export const TESTIMONIALS = [
  { quote: 'I finally see my month before it happens.', name: 'Marina', role: 'Designer' },
  { quote: 'It reads like a magazine and works like a spreadsheet.', name: 'Tomás', role: 'Engineer' },
  { quote: 'The first budgeting app I did not abandon in a week.', name: 'Aisha', role: 'Founder' },
  { quote: 'Calm, fast, and it never tries to sell me anything.', name: 'Lukas', role: 'Teacher' },
  { quote: 'We stopped doing bill maths in the group chat.', name: 'Sofia', role: 'Nurse' },
  { quote: 'My spending finally has a shape I can read.', name: 'Daniel', role: 'Writer' },
] as const

export const CTA = {
  eyebrow: 'You vs. the spreadsheet',
  title: 'Open the dashboard you’ve been meaning to build.',
  subtitle:
    'Two minutes from now, your first month is logged. If money is shared at home, Household keeps the bills and responsibilities clear too.',
  button: 'Start free',
} as const

export const FOOTER = {
  wordmark: 'PERSONAL BUDGET',
  tagline: 'Clarity for your money.',
  note: 'No ads · No trackers · No card on file',
} as const
