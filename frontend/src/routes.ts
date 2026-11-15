import type { AppPage } from './components/layout/header/navigation.config'

/** URL of every page. `/reports/print` is a standalone route handled in main.tsx. */
export const PAGE_PATHS: Record<AppPage, string> = {
  dashboard: '/',
  household: '/household',
  accounts: '/accounts',
  cards: '/cards',
  installments: '/installments',
  'fixed-payments': '/fixed-payments',
  commitments: '/commitments',
  behaviour: '/behaviour',
  earnings: '/earnings',
  business: '/business',
  'all-transactions': '/transactions',
  payments: '/payments',
  goals: '/goals',
  planning: '/planning',
  reports: '/reports',
  admin: '/admin',
}

/** Page that owns a pathname — including nested ones like `/cards/12` — or null if none does. */
export function pageFromPath(pathname: string): AppPage | null {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === '/') return 'dashboard'
  const entry = (Object.entries(PAGE_PATHS) as Array<[AppPage, string]>)
    .find(([, path]) => path !== '/' && (clean === path || clean.startsWith(`${path}/`)))
  return entry ? entry[0] : null
}

export const accountPath = (id: number) => `${PAGE_PATHS.accounts}/${id}`

/** A card's page; `statementPaymentDate` (yyyy-MM-dd) opens the statement due that day. */
export function cardPath(id: number, statementPaymentDate?: string) {
  const base = `${PAGE_PATHS.cards}/${id}`
  return statementPaymentDate ? `${base}?statement=${statementPaymentDate}` : base
}
