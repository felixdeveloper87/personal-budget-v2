import {
  FileText,
  Activity,
  LayoutDashboard,
  List,
  ReceiptText,
  Shield,
  Wallet,
  Sparkles,
  CalendarDays,
  CalendarClock,
  CreditCard,
  Home,
  TrendingUp,
  type LucideIcon,
} from '../../ui/icons'

export type AppPage =
  | 'dashboard'
  | 'household'
  | 'accounts'
  | 'cards'
  | 'installments'
  | 'fixed-payments'
  | 'commitments'
  | 'behaviour'
  | 'earnings'
  | 'all-transactions'
  | 'payments'
  | 'goals'
  | 'planning'
  | 'reports'
  | 'admin'

export interface NavItem {
  id: AppPage
  label: string
  shortLabel: string
  icon: LucideIcon
  description: string
}

type NavigationTranslator = (key: string, fallback: string) => string

/**
 * Keeps page ids and icons static while resolving only the user-facing copy.
 * Consumers can therefore localise any subset (including the admin item)
 * without duplicating or rebuilding the navigation configuration.
 */
export function localizeNavigationItems(
  items: ReadonlyArray<NavItem>,
  translate: NavigationTranslator,
): ReadonlyArray<NavItem> {
  return items.map((item) => ({
    ...item,
    label: translate(`nav.${item.id}.label`, item.label),
    shortLabel: translate(`nav.${item.id}.short`, item.shortLabel),
    description: translate(`nav.${item.id}.description`, item.description),
  }))
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your finances',
  },
  {
    id: 'household',
    label: 'Household',
    shortLabel: 'Household',
    icon: Home,
    description: 'Shared home expenses and balances',
  },
  {
    id: 'behaviour',
    label: 'Expenses',
    shortLabel: 'Expenses',
    icon: Activity,
    description: 'Expenses by transaction date',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    shortLabel: 'Earnings',
    icon: TrendingUp,
    description: 'Income by source and period',
  },
  {
    id: 'payments',
    label: 'Payments',
    shortLabel: 'Payments',
    icon: ReceiptText,
    description: 'When money leaves and what is ahead',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    shortLabel: 'Accounts',
    icon: Wallet,
    description: 'Balances and cards',
  },
  {
    id: 'cards',
    label: 'Cards',
    shortLabel: 'Cards',
    icon: CreditCard,
    description: 'Credit card statements',
  },
  {
    id: 'planning',
    label: 'Planning',
    shortLabel: 'Plan',
    icon: CalendarDays,
    description: 'Budgets and cash flow',
  },
  {
    id: 'commitments',
    label: 'Commitments',
    shortLabel: 'Commit.',
    icon: CalendarClock,
    description: 'Fixed payments and installment plans',
  },
  {
    id: 'all-transactions',
    label: 'All transactions',
    shortLabel: 'All',
    icon: List,
    description: 'Browse and manage every transaction',
  },
  {
    id: 'goals',
    label: 'Goals',
    shortLabel: 'Goals',
    icon: Sparkles,
    description: 'Savings targets',
  },
  {
    id: 'reports',
    label: 'Reports',
    shortLabel: 'Reports',
    icon: FileText,
    description: 'Export financial reports',
  },
]

/**
 * Installments and fixed payments now live under a single "Commitments" page,
 * but their legacy page ids are kept as deep links (they open the matching tab).
 * This maps a current page to the nav entry that should appear active.
 */
export function navItemIdFor(page: AppPage): AppPage {
  if (page === 'installments' || page === 'fixed-payments') return 'commitments'
  return page
}

export const ADMIN_NAV_ITEM: Readonly<NavItem> = {
  id: 'admin',
  label: 'Admin',
  shortLabel: 'Admin',
  icon: Shield,
  description: 'User approvals and plans',
}

export const LANDING_SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'demo', label: 'See it work' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
] as const

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]['id']
