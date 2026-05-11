import {
  ChartColumn,
  Layers,
  LayoutDashboard,
  ReceiptText,
  Shield,
  type LucideIcon,
} from '../../ui/icons'

export type AppPage = 'dashboard' | 'transactions' | 'categories' | 'charts' | 'admin'

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
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    description: 'Overview of your finances',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    shortLabel: 'Activity',
    icon: ReceiptText,
    description: 'All income and expenses',
  },
  {
    id: 'categories',
    label: 'Categories',
    shortLabel: 'Categories',
    icon: Layers,
    description: 'Breakdown by category',
  },
  {
    id: 'charts',
    label: 'Charts',
    shortLabel: 'Insights',
    icon: ChartColumn,
    description: 'Visual breakdown by period',
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
