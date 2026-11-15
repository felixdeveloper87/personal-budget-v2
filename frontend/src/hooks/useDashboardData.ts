import { useCallback, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Transaction, MonthlySummary } from '../types'
import { useSearch } from '../contexts/SearchContext'
import { convertMonthlySummary } from '../utils/summary'
import { hasActiveFilters } from '../utils/filters'
import { ToastService } from '../services/toast'
import { useMonthlySummary, useTransactionsSearch, useTransactionsWindow } from '../queries/hooks'

export interface LoadDashboardOptions {
  /**
   * Kept for callers written before the query cache: every refresh is now quiet
   * (cached data stays on screen while it revalidates), so this is ignored.
   */
  quiet?: boolean
}

const EMPTY: Transaction[] = []

/**
 * Transactions + monthly summary shared by the analysis pages (Dashboard,
 * Behaviour, Earnings, Goals, Payments, Planning).
 *
 * Instead of the whole history it loads a date window around `selectedDate`
 * (see `transactionsWindowFor`), cached by TanStack Query: revisiting a page or
 * browsing months of the same year paints instantly. With global search filters
 * active it runs the server search instead, over the whole history.
 */
export function useDashboardData(selectedDate: Date, _selectedPeriod?: string) {
  const { filters } = useSearch()
  const filtering = hasActiveFilters(filters)
  const queryClient = useQueryClient()

  const windowQuery = useTransactionsWindow(selectedDate, { enabled: !filtering })
  const searchQuery = useTransactionsSearch(filtering ? filters : null)
  const summaryQuery = useMonthlySummary(selectedDate, { enabled: !filtering })

  const active = filtering ? searchQuery : windowQuery
  const error = active.error ?? (filtering ? null : summaryQuery.error)
  useEffect(() => {
    if (error) ToastService.apiError(error, { title: 'Could not load dashboard', dedupeKey: 'dashboard-load-failed' })
  }, [error])

  const monthSummary = useMemo<MonthlySummary | null>(
    () => (!filtering && summaryQuery.data ? convertMonthlySummary(summaryQuery.data) : null),
    [filtering, summaryQuery.data],
  )

  /** Revalidates after a change made outside the API interceptor's reach. */
  const loadData = useCallback(async (_options?: LoadDashboardOptions) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
    ])
  }, [queryClient])

  return {
    transactions: active.data ?? EMPTY,
    monthSummary,
    // Only the very first load shows skeletons; refetches keep data on screen.
    loading: active.isPending && active.fetchStatus !== 'idle',
    loadData,
    filters,
  }
}
