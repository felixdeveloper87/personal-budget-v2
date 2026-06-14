/**
 * Landing v2 — "private banking" dark edition.
 * All copy lives here (English) so the page component stays about motion & layout.
 * Ported from docs/personal-budget-landing-v2.md.
 */

export const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'stats', label: 'Why us' },
] as const

export const HERO = {
  eyebrow: 'Private banking, for everyone',
  /** Headline is revealed line by line — keep each entry to one visual line. */
  lines: ['Clarity for', 'your money.'] as const,
  /** The word inside the last line that gets the serif gold accent. */
  accentWord: 'money.',
  subtitle:
    'Track every transaction, category and trend in one calm place. No spreadsheets, no noise — just the picture, kept sharp.',
  primaryCta: 'Get started — it’s free',
  secondaryCta: 'See the dashboard',
} as const

/** The 3D card object in the hero. */
export const HERO_CARD = {
  brand: 'PERSONAL BUDGET',
  tier: 'Private',
  number: '•••• •••• •••• 2287',
  holder: 'YOUR MONEY',
  valid: '∞ / ∞',
  balanceLabel: 'Available balance',
  balance: '£2,287.20',
} as const

/** Floating glass pills around the card. */
export const HERO_PILLS = [
  { id: 'income', label: 'Salary · April', amount: '+£3,200', tone: 'mint' as const },
  { id: 'grocery', label: 'Groceries · Continente', amount: '−£42.80', tone: 'muted' as const },
  { id: 'budget', label: 'Groceries budget', amount: '77%', tone: 'gold' as const },
] as const

/** Infinite ticker categories. */
export const TICKER = [
  'Groceries',
  'Salary',
  'Rent',
  'Transport',
  'Dining',
  'Subscriptions',
  'Savings',
  'Utilities',
  'Travel',
  'Health',
  'Investments',
  'Side income',
] as const

export const FEATURES = [
  {
    id: 'live',
    title: 'Live balance',
    description:
      'Income, expenses and balance update the instant you log a transaction — and every chart redraws itself.',
    /** SVG path that self-draws on reveal (24×24 viewBox). */
    icon: 'M3 12h4l3 7 4-14 3 7h4',
  },
  {
    id: 'categories',
    title: 'Categories you control',
    description:
      'Build the taxonomy that fits your life. Group, rename and recolour — the breakdown is always yours.',
    icon: 'M12 3v18 M3 12h18 M5.6 5.6l12.8 12.8 M18.4 5.6L5.6 18.4',
  },
  {
    id: 'search',
    title: 'Search in milliseconds',
    description:
      'Press ⌘K and find any transaction by amount, category, note or date range. Results before you finish typing.',
    icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5',
  },
] as const

/** Live feed — new rows are prepended on an interval. */
export const FEED_SAMPLES = [
  { label: 'Coffee · Starbucks', amount: '−£4.20', tone: 'muted' as const },
  { label: 'Refund · Amazon', amount: '+£18.99', tone: 'mint' as const },
  { label: 'Transport · Metro', amount: '−£2.40', tone: 'muted' as const },
  { label: 'Dining · Trattoria', amount: '−£36.10', tone: 'muted' as const },
  { label: 'Invoice · Side project', amount: '+£540.00', tone: 'mint' as const },
  { label: 'Subscription · Spotify', amount: '−£15.99', tone: 'muted' as const },
  { label: 'Utilities · Energy', amount: '−£61.30', tone: 'muted' as const },
  { label: 'Savings · Auto-transfer', amount: '−£200.00', tone: 'gold' as const },
] as const

/** Dashboard preview — weekly bars (0..1) and donut segments. */
export const BARS = [
  { label: 'M', value: 0.42 },
  { label: 'T', value: 0.78 },
  { label: 'W', value: 0.55 },
  { label: 'T', value: 0.92 },
  { label: 'F', value: 0.65 },
  { label: 'S', value: 0.34 },
  { label: 'S', value: 0.5 },
] as const

export const DONUT = [
  { label: 'Essentials', value: 46, color: 'var(--gold)' },
  { label: 'Lifestyle', value: 28, color: 'var(--mint)' },
  { label: 'Savings', value: 18, color: '#8B93A7' },
  { label: 'Other', value: 8, color: 'rgba(245,242,234,0.25)' },
] as const

/** Animated counters. */
export const STATS = [
  { id: 'price', prefix: '£', value: 0, suffix: '', label: 'Forever — no premium tier, no asterisk' },
  { id: 'setup', prefix: '', value: 60, suffix: 's', label: 'From sign-up to your first insight' },
  { id: 'export', prefix: '', value: 100, suffix: '%', label: 'Your data, exportable any time' },
] as const

export const CTA = {
  eyebrow: 'You vs. the spreadsheet',
  title: 'Open the dashboard you’ve been meaning to build.',
  subtitle:
    'Two minutes from now your first month is logged, and the charts are already telling you something.',
  button: 'Start free',
} as const

export const FOOTER = {
  wordmark: 'PERSONAL BUDGET',
  tagline: 'Clarity for your money.',
  note: 'No ads. No trackers. No card on file.',
} as const
