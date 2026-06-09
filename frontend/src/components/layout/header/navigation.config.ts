import {
  FileText,
  Layers,
  LayoutDashboard,
  ReceiptText,
  Repeat,
  Shield,
  Wallet,
  Sparkles,
  CalendarDays,
  CalendarClock,
  CreditCard,
  type LucideIcon,
} from '../../ui/icons'

export type AppPage =
  | 'dashboard'
  | 'accounts'
  | 'transfers'
  | 'installments'
  | 'fixed-payments'
  | 'transactions'
  | 'categories'
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

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    id: 'dashboard',
    label: 'Home',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    description: 'Overview of your finances',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    shortLabel: 'Accounts',
    icon: Wallet,
    description: 'Balances and cards',
  },
  {
    id: 'categories',
    label: 'Categories',
    shortLabel: 'Categories',
    icon: Layers,
    description: 'Breakdown by category',
  },
  {
    id: 'planning',
    label: 'Planning',
    shortLabel: 'Plan',
    icon: CalendarDays,
    description: 'Budgets and cash flow',
  },
  {
    id: 'installments',
    label: 'Installments',
    shortLabel: 'Installments',
    icon: CreditCard,
    description: 'Purchase plans and payments',
  },
  {
    id: 'fixed-payments',
    label: 'Fixed payments',
    shortLabel: 'Fixed',
    icon: CalendarClock,
    description: 'Monthly payments and incomes',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    shortLabel: 'Activity',
    icon: ReceiptText,
    description: 'All income and expenses',
  },
  {
    id: 'transfers',
    label: 'Transfers',
    shortLabel: 'Transfers',
    icon: Repeat,
    description: 'Move money between accounts',
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

export const ADMIN_NAV_ITEM: Readonly<NavItem> = {
  id: 'admin',
  label: 'Admin',
  shortLabel: 'Admin',
  icon: Shield,
  description: 'User approvals and plans',
}

export const LANDING_SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
] as const

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]['id']
