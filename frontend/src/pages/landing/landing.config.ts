import {
  BarChart3,
  Calendar,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Moon,
  PieChart,
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
    title: 'Insights that move first',
    description:
      'Income, expenses and balance update the moment you log a transaction — and the charts redraw themselves.',
    variant: 'hero',
    accent: '#3b82f6',
  },
  {
    id: 'categories',
    icon: PieChart,
    title: 'Categories you control',
    description: 'Build the taxonomy that fits your life. Group, rename, recolor.',
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
    id: 'quick-add',
    icon: Zap,
    title: 'Lightning-fast entry',
    description:
      'Number-pad input, smart category suggestions, two-tap logging. Recording a transaction takes less time than the receipt did.',
    variant: 'card',
    accent: '#06b6d4',
  },
  {
    id: 'periods',
    icon: Calendar,
    title: 'Day · Week · Month · Year',
    description: 'Zoom in on a single day or out to a full year — same UI, same speed.',
    variant: 'card',
    accent: '#f97316',
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
    description: 'No premium tier, no upsell, no “unlock for $9/mo”.',
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
    question: 'Can I import statements from my bank?',
    answer:
      'Not yet. Manual entry keeps the experience fast and private. CSV/OFX import is on the roadmap, with explicit user-side approval for each row.',
  },
  {
    question: 'Does it work on my phone?',
    answer:
      'It’s designed for the phone first. The web app installs as a PWA and behaves like a native app on iOS and Android.',
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
    currency: '$',
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

