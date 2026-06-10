import {
  BarChart3,
  CalendarCheck,
  ChartLineUp,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Layers,
  Lightbulb,
  Moon,
  PieChart,
  ReceiptText as Receipt,
  Repeat,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  type LucideIcon,
} from '../../components/ui/icons'
import { BRAND, BRAND_PROMISES } from '../../components/layout/header/brand.config'

export interface LandingFeature {
  id: string
  icon: LucideIcon
  title: string
  description: string
  /** `hero` renders large; `card` renders compact in the bento grid. */
  variant: 'hero' | 'card'
  /** Hex token for accent (used for glow/border on hover). */
  accent: string
}

export interface LandingStep {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingTrustItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingFaq {
  question: string
  answer: string
}

export interface LandingBenefit {
  id: string
  icon: LucideIcon
  label: string
}

export interface LandingDemoStep {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

/**
 * HERO copy — strings unique to the hero live here.
 * Tagline split, CTAs and bullets are derived from BRAND so changing the
 * voice of the product is a one-file edit (`brand.config.ts`).
 */
export const HERO_COPY = {
  eyebrow: 'Personal finance, distilled',
  /** Tagline first words — `"Clarity for your"` */
  titlePrimary: BRAND.taglinePrimary,
  /** Tagline last word — gets the gradient. `"money"` */
  titleAccent: BRAND.taglineAccent,
  subtitle:
    'Track income and expenses without the spreadsheet pain. Personal Budget keeps the picture sharp — every transaction, category, and trend in one calm place.',
  primaryCta: BRAND.cta.hero,
  secondaryCta: BRAND.cta.heroSecondary,
  bullets: BRAND_PROMISES.hero,
} as const

export const FEATURES: ReadonlyArray<LandingFeature> = [
  {
    id: 'insights',
    icon: TrendingUp,
    title: 'Know where your money goes',
    description:
      'Income, expenses and balance update the moment you log a transaction — and the charts redraw themselves.',
    variant: 'hero',
    accent: '#3b82f6',
  },
  {
    id: 'forecasting',
    icon: ChartLineUp,
    title: 'Cash flow forecasting',
    description:
      'See your projected balance months ahead. Set category budgets and watch the forecast adjust in real time.',
    variant: 'card',
    accent: '#6366f1',
  },
  {
    id: 'categories',
    icon: PieChart,
    title: 'Categories you control',
    description: 'Build the taxonomy that fits your life. Group, rename, recolor — your way.',
    variant: 'card',
    accent: '#8b5cf6',
  },
  {
    id: 'installments',
    icon: Repeat,
    title: 'Installments, automated',
    description:
      'Split a purchase into months and let future-you see the bill before it lands.',
    variant: 'card',
    accent: '#14b8a6',
  },
  {
    id: 'goals',
    icon: CalendarCheck,
    title: 'Savings goals',
    description:
      'Set a target, track your progress. Goals live alongside your accounts without touching your real balance.',
    variant: 'card',
    accent: '#22c55e',
  },
  {
    id: 'search',
    icon: Search,
    title: 'Search anything in milliseconds',
    description: 'Press ⌘K, find a transaction by amount, category, note or date range.',
    variant: 'card',
    accent: '#ec4899',
  },
] as const

/**
 * Slim "immediate feedback" band right under the hero.
 * Honest, verifiable claims only — these all map to real product behavior.
 */
export const BENEFIT_STRIP: ReadonlyArray<LandingBenefit> = [
  { id: 'setup', icon: Zap, label: BRAND.promises.fastSetup },
  { id: 'categories', icon: Layers, label: 'Categories you fully control' },
  { id: 'devices', icon: Smartphone, label: 'Phone, tablet and desktop' },
  { id: 'export', icon: Database, label: 'Export your data any time' },
] as const

/**
 * Product demo — a tiny simulated journey: log → balance → budget → insight.
 * Numbers are illustrative and consistent with each other (no fake stats).
 */
export const DEMO = {
  eyebrow: 'See it in action',
  title: 'One transaction. Everything follows.',
  subtitle:
    'You log the expense once — the balance, the budget and the insight take care of themselves. This is the whole loop, simulated.',
  steps: [
    {
      id: 'log',
      icon: Receipt,
      title: 'Log a transaction',
      description: 'Groceries, −£42.80. An amount, a category, one tap.',
    },
    {
      id: 'balance',
      icon: Wallet,
      title: 'Your balance updates',
      description: 'No refresh, no mental math — the new number is just there.',
    },
    {
      id: 'budget',
      icon: PieChart,
      title: 'The budget recalculates',
      description: 'Category progress moves the moment the expense lands.',
    },
    {
      id: 'insight',
      icon: Lightbulb,
      title: 'You get the insight',
      description: 'Still under budget — and you know it before month-end.',
    },
  ] as ReadonlyArray<LandingDemoStep>,
  /** Figures used by the demo canvas — kept consistent across stages. */
  figures: {
    currency: '£',
    txLabel: 'Groceries · Continente',
    txAmount: -42.8,
    balanceBefore: 2330,
    balanceAfter: 2287.2,
    budgetCategory: 'Groceries',
    budgetTotal: 320,
    budgetSpentBefore: 204.2,
    budgetSpentAfter: 247,
    insight: 'Groceries is on pace to finish £45 under budget this month.',
  },
} as const

export const STEPS: ReadonlyArray<LandingStep> = [
  {
    id: 'create',
    icon: Sparkles,
    title: 'Create your account',
    description: 'Email, password, you’re in. No card asked.',
  },
  {
    id: 'log',
    icon: CreditCard,
    title: 'Log a transaction',
    description: 'Amount, category, optional note. Two taps from the dashboard.',
  },
  {
    id: 'see',
    icon: BarChart3,
    title: 'See where it goes',
    description: 'The dashboard explains your month before you have to ask.',
  },
  {
    id: 'decide',
    icon: TrendingUp,
    title: 'Decide on purpose',
    description: 'Adjust categories, set installments, plan the next month.',
  },
] as const

export const TRUST: ReadonlyArray<LandingTrustItem> = [
  {
    id: 'encrypted',
    icon: Shield,
    title: 'Encrypted in transit',
    description: 'TLS everywhere, JWT-backed sessions.',
  },
  {
    id: 'no-tracking',
    icon: EyeOff,
    title: 'No third-party tracking',
    description: 'No ad pixels, no analytics SDKs trailing you.',
  },
  {
    id: 'export',
    icon: Database,
    title: 'Your data, exportable',
    description: 'Leave whenever you want — your records come with you.',
  },
  {
    id: 'free',
    icon: Wallet,
    title: 'Free, with no asterisk',
    description: 'No premium tier, no upsell, no “unlock for £9/mo”.',
  },
  {
    id: 'cross',
    icon: Smartphone,
    title: 'Mobile-first',
    description: 'Designed for the phone, polished for the desktop.',
  },
  {
    id: 'dark',
    icon: Moon,
    title: 'Dark mode that ships',
    description: 'Not an afterthought — every screen is tuned for both modes.',
  },
] as const

export const FAQS: ReadonlyArray<LandingFaq> = [
  {
    question: 'Is Personal Budget really free?',
    answer:
      'Yes — every feature, no premium tier, no card on file. The product is the product.',
  },
  {
    question: 'Where does my data live?',
    answer:
      'On the Personal Budget servers, encrypted in transit and bound to your account. You can export it as a structured file at any time.',
  },
  {
    question: 'Can I import transactions from a file?',
    answer:
      'Yes — you can import a CSV file directly from the Transactions page. Each row is previewed before anything is saved, so you stay in control.',
  },
  {
    question: 'Does it work on my phone?',
    answer:
      'Yes. The responsive web interface is designed for phones, tablets and desktop browsers.',
  },
  {
    question: 'Will you add more features?',
    answer:
      'Yes — slowly. The product earns features by deserving them; nothing ships unless it makes the dashboard easier to read or the data easier to trust.',
  },
] as const

/**
 * Final closing CTA — only the copy unique to this section lives here.
 * CTA label and bullets are derived from BRAND for voice consistency.
 */
export const FINAL_CTA = {
  eyebrow: 'You vs. the spreadsheet',
  title: 'Open the dashboard you’ve been meaning to build.',
  subtitle:
    'Two minutes from now, your first month is logged and the charts are already telling you something.',
  cta: BRAND.cta.final,
  bullets: BRAND_PROMISES.finalCta,
} as const

/** Decorative meta used by Hero / DashboardPreview */
export const PREVIEW_DATA = {
  totals: {
    income: 4280,
    expenses: 1950,
    balance: 2330,
    currency: '£',
  },
  recent: [
    { id: 1, label: 'Salary · April', amount: 3200, kind: 'income' as const, icon: Sparkles },
    { id: 2, label: 'Groceries · Continente', amount: -84.5, kind: 'expense' as const, icon: Wallet },
    { id: 3, label: 'Spotify family', amount: -15.99, kind: 'expense' as const, icon: Eye },
    { id: 4, label: 'Side project · invoice', amount: 540, kind: 'income' as const, icon: TrendingUp },
  ],
  bars: [
    { label: 'M', value: 0.42 },
    { label: 'T', value: 0.78 },
    { label: 'W', value: 0.55 },
    { label: 'T', value: 0.92 },
    { label: 'F', value: 0.65 },
    { label: 'S', value: 0.34 },
    { label: 'S', value: 0.5 },
  ],
} as const

