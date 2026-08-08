export const NAV_LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'household', label: 'Household' },
] as const

export const HERO = {
  eyebrow: 'Personal finance, without the noise',
  line1: 'Know where you stand.',
  line2: 'Choose what comes next.',
  subtitle:
    'Personal Budget brings accounts, everyday spending, commitments, plans and shared household costs into one calm view.',
  primaryCta: 'Request free access',
  secondaryCta: 'Explore the product',
  signInCta: 'Sign in',
  accessNote: 'Free access · No card required · New accounts are reviewed before activation',
} as const

export const PROOF_POINTS = [
  {
    number: '01',
    title: 'One financial home',
    copy: 'Balances, spending, commitments and goals stay connected.',
  },
  {
    number: '02',
    title: 'Your data, portable',
    copy: 'Export transactions to CSV and reports to PDF.',
  },
  {
    number: '03',
    title: 'Built for real life',
    copy: 'Manage your own money and the costs you share at home.',
  },
] as const

export const PRODUCT_TICKER = [
  'Dashboard',
  'Accounts',
  'Behaviour',
  'Payments',
  'Planning',
  'Goals',
  'Reports',
  'Household',
] as const

export const SNAPSHOT = {
  period: 'August 2026',
  greeting: 'Good evening',
  availableLabel: 'Available now',
  available: '\u00a32,287.20',
  delta: '+\u00a3540.00 this month',
  income: '\u00a34,280.00',
  expenses: '\u00a31,992.80',
  forecast: '\u00a32,640.00',
  transactions: [
    { label: 'Salary', meta: 'Today', amount: '+\u00a33,200.00', tone: 'income' as const },
    { label: 'Groceries', meta: 'Continente', amount: '\u2212\u00a342.80', tone: 'expense' as const },
    { label: 'Side project', meta: 'Invoice', amount: '+\u00a3540.00', tone: 'income' as const },
  ],
  categories: [
    { label: 'Essentials', value: 68 },
    { label: 'Lifestyle', value: 42 },
    { label: 'Savings', value: 81 },
  ],
} as const

export const FEATURE_CARDS = [
  {
    kind: 'search',
    eyebrow: 'Find',
    title: 'Search without digging',
    copy: 'Jump from a name, shop or amount straight to the transaction you need.',
    meta: 'Fast global search',
  },
  {
    kind: 'commitments',
    eyebrow: 'Remember',
    title: 'Commitments stay visible',
    copy: 'Recurring payments and instalments remain part of the picture.',
    meta: 'Fixed payments + instalments',
  },
  {
    kind: 'reports',
    eyebrow: 'Explain',
    title: 'Reports that read clearly',
    copy: 'Turn a busy month into a useful breakdown, then take it with you.',
    meta: 'CSV + PDF export',
  },
  {
    kind: 'privacy',
    eyebrow: 'Own',
    title: 'Your numbers stay yours',
    copy: 'A focused finance workspace with portable data and no public profile.',
    meta: 'Private by default',
  },
] as const

export const PLANNING = {
  eyebrow: '02 — Plan',
  title: 'Tomorrow, already in view.',
  copy:
    'See what is committed, what is flexible and where the month is likely to land before the next payment arrives.',
  bullets: [
    'Cash-flow forecast',
    'Goals and monthly commitments',
    'A clear view of upcoming payments',
  ],
  months: [
    { label: 'Aug', value: '\u00a32,287', active: true },
    { label: 'Sep', value: '\u00a32,640', active: false },
    { label: 'Oct', value: '\u00a32,510', active: false },
  ],
} as const

export const HOUSEHOLD = {
  eyebrow: '03 — Share',
  title: 'Split the cost. Keep the relationship.',
  copy:
    'Household keeps shared expenses, balances, repayments and weekly responsibilities in one fair, readable place.',
  bullets: [
    'Equal shares calculated for you',
    'One net balance between each pair',
    'Settlements and private proof attachments',
    'A weekly home rota everyone can see',
  ],
  bill: {
    label: 'Electricity bill',
    meta: 'Paid by Leandro · split 5 ways',
    amount: '\u00a320 each',
  },
  cleaning: {
    label: 'Cleaning this week',
    meta: '4–10 August',
    person: 'Tom',
  },
  balance: {
    label: 'Net balance',
    from: 'Aisha',
    to: 'Leandro',
    amount: '\u00a310.00',
  },
} as const

export const FINAL_CTA = {
  eyebrow: 'A calmer money habit starts here',
  title: 'Make your money easier to read.',
  copy:
    'Create your account for free. Once approved, you can build your first clear financial picture.',
  button: 'Request free access',
  note: 'No card required · Export when you want',
} as const

export const FOOTER = {
  wordmark: 'PERSONAL BUDGET',
  tagline: 'Clarity for your money.',
  note: 'Designed for everyday decisions.',
} as const
