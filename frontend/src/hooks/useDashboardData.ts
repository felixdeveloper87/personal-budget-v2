import { useEffect, useRef, useState, useCallback } from 'react'
import { Transaction, MonthlySummary } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import { getMonthlySummary, listTransactions, searchTransactions } from '../api'
import { convertMonthlySummary } from '../utils/summary'
import { hasActiveFilters } from '../utils/filters'
import { ToastService } from '../services/toast'

export interface LoadDashboardOptions {
  /**
   * When true, skips the global skeleton (`loading`): use after inline actions that should not
   * unmount dashboard sections (e.g. cancel recurring from Fixed payments modal).
   */
  quiet?: boolean
}

/* -------------------------------------------------------------------------- */
/* Module-level stale-while-revalidate cache                                   */
/* -------------------------------------------------------------------------- */
/**
 * The dashboard data (all transactions + monthly summary) is shared by several
 * pages (Dashboard, Transactions, Categories, Goals). Each one mounts/unmounts on
 * navigation, so without a cache every visit refetched everything from the
 * backend — that's the delay.
 *
 * This cache lets a re-visit paint instantly from the last result and only
 * revalidates in the background when the data is older than `STALE_TTL_MS`
 * (or when a month we haven't seen yet is requested). It's keyed by the user
 * token and cleared on logout / user switch. Mutations call `loadData()`, which
 * always refetches.
 */
const STALE_TTL_MS = 30_000

let cachedToken: string | null = null
let cachedTransactions: Transaction[] | null = null
const cachedSummaries = new Map<string, MonthlySummary>()
let cachedAt = 0

function summaryKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function resetCacheFor(token: string | null) {
  if (token !== cachedToken) {
    cachedToken = token
    cachedTransactions = null
    cachedSummaries.clear()
    cachedAt = 0
  }
}

export function useDashboardData(selectedDate: Date, selectedPeriod?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { filters } = useSearch()

  // Identifies the most recent in-flight request so out-of-order responses
  // (e.g. a background revalidation for a month you've already navigated away
  // from) don't clobber the current view. Acts as a lightweight AbortController.
  const requestIdRef = useRef(0)

  /** Hits the backend, refreshes the cache, and updates state. */
  const fetchFresh = useCallback(
    async (quiet: boolean) => {
      const token = user?.token
      if (!token) return
      const requestId = ++requestIdRef.current
      const isCurrent = () => requestId === requestIdRef.current
      if (!quiet) setLoading(true)
      try {
        if (hasActiveFilters(filters)) {
          // Search results are user-specific and not cached.
          const filtered = await searchTransactions(filters ?? {})
          if (isCurrent()) {
            setTransactions(filtered)
            setMonthSummary(null)
          }
        } else {
          const [transactionsData, summaryData] = await Promise.all([
            listTransactions(),
            getMonthlySummary(selectedDate),
          ])
          if (isCurrent()) {
            const summary = convertMonthlySummary(summaryData)
            cachedToken = token
            cachedTransactions = transactionsData
            cachedSummaries.set(summaryKey(selectedDate), summary)
            cachedAt = Date.now()
            setTransactions(transactionsData)
            setMonthSummary(summary)
          }
        }
      } catch (err) {
        console.error(err)
        ToastService.apiError(err, {
          title: 'Could not load dashboard',
          dedupeKey: 'dashboard-load-failed',
        })
        // Keep showing cached data on a background failure; only clear when this
        // is still the active request and we have nothing to fall back on.
        if (isCurrent() && (!cachedTransactions || hasActiveFilters(filters))) {
          setTransactions([])
          setMonthSummary(null)
        }
      } finally {
        // `loading` is always released so a superseded request can never strand
        // the skeleton; only the latest request applies data above.
        if (!quiet) setLoading(false)
      }
    },
    [user?.token, selectedDate, filters],
  )

  /** Public refresh — always revalidates. Used after mutations. */
  const loadData = useCallback(
    async (options?: LoadDashboardOptions) => {
      await fetchFresh(options?.quiet === true)
    },
    [fetchFresh],
  )

  // Mount / dependency changes: paint from cache instantly, revalidate if stale.
  useEffect(() => {
    const token = user?.token ?? null
    resetCacheFor(token)
    if (!token) return

    if (!hasActiveFilters(filters) && cachedTransactions) {
      setTransactions(cachedTransactions)
      setMonthSummary(cachedSummaries.get(summaryKey(selectedDate)) ?? null)
      setLoading(false)

      const isStale = Date.now() - cachedAt >= STALE_TTL_MS
      const missingSummary = !cachedSummaries.has(summaryKey(selectedDate))
      if (isStale || missingSummary) {
        void fetchFresh(true)
      }
    } else {
      void fetchFresh(false)
    }
  }, [fetchFresh, user?.token, selectedDate, filters])

  return {
    transactions,
    monthSummary,
    loading,
    loadData,
    filters,
  }
}
