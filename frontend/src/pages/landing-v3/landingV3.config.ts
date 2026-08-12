import type { TranslationValues } from '../../i18n/types'

type Translate = (key: string, values?: TranslationValues, fallback?: string) => string
type FormatCurrency = (value: number, options?: Intl.NumberFormatOptions) => string

const signedCurrency = (formatCurrency: FormatCurrency, value: number) =>
  `${value >= 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`

export const createLandingV3Config = (t: Translate, formatCurrency: FormatCurrency) => ({
  navLinks: [
    { id: 'overview', label: t('landing.nav.overview') },
    { id: 'features', label: t('landing.nav.features') },
    { id: 'household', label: t('landing.nav.household') },
  ] as const,

  hero: {
    line1: t('landing.hero.line1'),
    line2: t('landing.hero.line2'),
    subtitle: t('landing.hero.subtitle'),
    primaryCta: t('landing.hero.primaryCta'),
    secondaryCta: t('landing.hero.secondaryCta'),
    signInCta: t('landing.hero.signInCta'),
    accessNote: t('landing.hero.accessNote'),
  },

  proofPoints: [
    {
      number: '01',
      title: t('landing.proof.financialHome.title'),
      copy: t('landing.proof.financialHome.copy'),
    },
    {
      number: '02',
      title: t('landing.proof.portableData.title'),
      copy: t('landing.proof.portableData.copy'),
    },
    {
      number: '03',
      title: t('landing.proof.realLife.title'),
      copy: t('landing.proof.realLife.copy'),
    },
  ] as const,

  productTicker: [
    t('landing.product.dashboard'),
    t('landing.product.accounts'),
    t('landing.product.behaviour'),
    t('landing.product.payments'),
    t('landing.product.planning'),
    t('landing.product.goals'),
    t('landing.product.reports'),
    t('landing.product.household'),
  ],

  snapshot: {
    period: t('landing.snapshot.period'),
    greeting: t('landing.snapshot.greeting'),
    availableLabel: t('landing.snapshot.availableLabel'),
    available: formatCurrency(2287.2),
    delta: t('landing.snapshot.delta', { amount: signedCurrency(formatCurrency, 540) }),
    income: formatCurrency(4280),
    expenses: formatCurrency(1992.8),
    forecast: formatCurrency(2640),
    transactions: [
      {
        label: t('landing.snapshot.transaction.salary'),
        meta: t('landing.snapshot.transaction.today'),
        amount: signedCurrency(formatCurrency, 3200),
        tone: 'income' as const,
      },
      {
        label: t('landing.snapshot.transaction.groceries'),
        meta: 'Continente',
        amount: signedCurrency(formatCurrency, -42.8),
        tone: 'expense' as const,
      },
      {
        label: t('landing.snapshot.transaction.sideProject'),
        meta: t('landing.snapshot.transaction.invoice'),
        amount: signedCurrency(formatCurrency, 540),
        tone: 'income' as const,
      },
    ],
    categories: [
      { label: t('landing.snapshot.category.essentials'), value: 68 },
      { label: t('landing.snapshot.category.lifestyle'), value: 42 },
      { label: t('landing.snapshot.category.savings'), value: 81 },
    ],
  },

  featureCards: [
    {
      kind: 'search' as const,
      eyebrow: t('landing.feature.search.eyebrow'),
      title: t('landing.feature.search.title'),
      copy: t('landing.feature.search.copy'),
      meta: t('landing.feature.search.meta'),
    },
    {
      kind: 'commitments' as const,
      eyebrow: t('landing.feature.commitments.eyebrow'),
      title: t('landing.feature.commitments.title'),
      copy: t('landing.feature.commitments.copy'),
      meta: t('landing.feature.commitments.meta'),
    },
    {
      kind: 'reports' as const,
      eyebrow: t('landing.feature.reports.eyebrow'),
      title: t('landing.feature.reports.title'),
      copy: t('landing.feature.reports.copy'),
      meta: t('landing.feature.reports.meta'),
    },
    {
      kind: 'privacy' as const,
      eyebrow: t('landing.feature.privacy.eyebrow'),
      title: t('landing.feature.privacy.title'),
      copy: t('landing.feature.privacy.copy'),
      meta: t('landing.feature.privacy.meta'),
    },
  ],

  planning: {
    eyebrow: t('landing.planning.eyebrow'),
    title: t('landing.planning.title'),
    copy: t('landing.planning.copy'),
    bullets: [
      t('landing.planning.bullet.forecast'),
      t('landing.planning.bullet.goals'),
      t('landing.planning.bullet.upcoming'),
    ],
    months: [
      {
        label: t('landing.month.aug.short'),
        value: formatCurrency(2287, { maximumFractionDigits: 0 }),
        active: true,
      },
      {
        label: t('landing.month.sep.short'),
        value: formatCurrency(2640, { maximumFractionDigits: 0 }),
        active: false,
      },
      {
        label: t('landing.month.oct.short'),
        value: formatCurrency(2510, { maximumFractionDigits: 0 }),
        active: false,
      },
    ],
  },

  household: {
    eyebrow: t('landing.household.eyebrow'),
    title: t('landing.household.title'),
    copy: t('landing.household.copy'),
    bullets: [
      t('landing.household.bullet.equalShares'),
      t('landing.household.bullet.netBalance'),
      t('landing.household.bullet.settlements'),
      t('landing.household.bullet.rota'),
    ],
    bill: {
      label: t('landing.household.preview.electricity'),
      meta: t('landing.household.preview.billMeta', { payer: 'Leandro', count: 5 }),
      amount: t('landing.household.preview.each', { amount: formatCurrency(20) }),
    },
    cleaning: {
      label: t('landing.household.preview.cleaning'),
      meta: t('landing.household.preview.cleaningDates'),
      person: 'Tom',
    },
    balance: {
      label: t('landing.household.preview.netBalance'),
      from: 'Aisha',
      to: 'Leandro',
      amount: formatCurrency(10),
    },
  },

  finalCta: {
    eyebrow: t('landing.finalCta.eyebrow'),
    title: t('landing.finalCta.title'),
    copy: t('landing.finalCta.copy'),
    button: t('landing.finalCta.button'),
    note: t('landing.finalCta.note'),
  },

  footer: {
    wordmark: 'PERSONAL BUDGET',
    tagline: t('landing.footer.tagline'),
    note: t('landing.footer.note'),
  },
})

export type LandingV3Content = ReturnType<typeof createLandingV3Config>
export type LandingFeatureKind = LandingV3Content['featureCards'][number]['kind']

// Backwards compatibility for the authenticated app footer while it is migrated
// to the shared i18n resources.
/** @deprecated Use createLandingV3Config for localised landing-page content. */
export const FOOTER = {
  wordmark: 'PERSONAL BUDGET',
  tagline: 'Clarity for your money.',
  note: 'Designed for everyday decisions.',
} as const
