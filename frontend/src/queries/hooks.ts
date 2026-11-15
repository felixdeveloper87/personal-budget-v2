import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getAccountSummary,
  getCardStatements,
  getCardsOverview,
  getMonthlySummary,
  getTransactionsPage,
  listInstallmentPlans,
  listPaymentMethods,
  listTransactionsInWindow,
  searchTransactions,
} from '../api'
import { useAuth } from '../contexts/AuthContext'
import type { SearchFilters } from '../contexts/SearchContext'
import { queryKeys } from './keys'

/** Page size for the paginated transactions list. */
export const TRANSACTIONS_PAGE_SIZE = 50

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

/**
 * Date window the analysis pages load around a selected date: the whole previous
 * year (period-over-period comparisons and 90–120-day look-backs reach into it)
 * through two years ahead (scheduled installments and fixed payments).
 *
 * The window depends only on the selected *year*, so browsing months inside a
 * year — and every page that looks at the same year — reuses one cached request.
 */
export function transactionsWindowFor(date: Date): { from: string; to: string } {
  const year = date.getFullYear()
  return {
    from: isoDay(new Date(year - 1, 0, 1)),
    to: isoDay(new Date(year + 2, 11, 31)),
  }
}

function useSignedIn() {
  const { user } = useAuth()
  return Boolean(user?.token)
}

export function useAccountSummary() {
  const enabled = useSignedIn()
  return useQuery({ queryKey: queryKeys.accountSummary, queryFn: getAccountSummary, enabled })
}

export function usePaymentMethods() {
  const enabled = useSignedIn()
  return useQuery({ queryKey: queryKeys.paymentMethods, queryFn: listPaymentMethods, enabled })
}

export function useCardsOverview() {
  const enabled = useSignedIn()
  return useQuery({ queryKey: queryKeys.cardsOverview, queryFn: getCardsOverview, enabled })
}

export function useCardStatements(cardId: number | null) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: queryKeys.cardStatements(cardId ?? -1),
    queryFn: () => getCardStatements(cardId as number),
    enabled: signedIn && cardId !== null,
  })
}

export function useInstallmentPlans() {
  const enabled = useSignedIn()
  return useQuery({ queryKey: queryKeys.installmentPlans, queryFn: listInstallmentPlans, enabled })
}

/** Transactions around `date` (see {@link transactionsWindowFor}). */
export function useTransactionsWindow(date: Date, options: { enabled?: boolean } = {}) {
  const signedIn = useSignedIn()
  const { from, to } = transactionsWindowFor(date)
  return useQuery({
    queryKey: queryKeys.transactionsWindow(from, to),
    queryFn: () => listTransactionsInWindow(from, to),
    enabled: signedIn && (options.enabled ?? true),
    // Moving to another year keeps showing the previous data until the new window arrives.
    placeholderData: keepPreviousData,
  })
}

/** Server-side search with the global search filters (whole history). */
export function useTransactionsSearch(filters: SearchFilters | null) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: queryKeys.transactionsSearch(filters ?? {}),
    queryFn: () => searchTransactions(filters ?? {}),
    enabled: signedIn && filters !== null,
  })
}

export function useMonthlySummary(date: Date, options: { enabled?: boolean } = {}) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: queryKeys.monthlySummary(monthKey(date)),
    queryFn: () => getMonthlySummary(date),
    enabled: signedIn && (options.enabled ?? true),
  })
}

/** Newest-first pages of transactions, optionally filtered; `fetchNextPage` loads older ones. */
export function useTransactionPages(filters: SearchFilters | null) {
  const signedIn = useSignedIn()
  return useInfiniteQuery({
    queryKey: queryKeys.transactionsPages(filters),
    queryFn: ({ pageParam }) => getTransactionsPage({
      ...(filters ?? {}),
      page: pageParam,
      size: TRANSACTIONS_PAGE_SIZE,
    }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: signedIn,
  })
}
