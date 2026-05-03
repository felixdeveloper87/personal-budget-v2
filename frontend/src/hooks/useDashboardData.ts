import { useEffect, useState, useCallback } from 'react'
import { Transaction, MonthlySummary } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import { getMonthlySummary, listTransactions, searchTransactions } from '../api'
import { convertMonthlySummary } from '../utils/summary'
import { hasActiveFilters } from '../utils/filters'

export interface LoadDashboardOptions {
  /**
   * When true, skips the global skeleton (`loading`): use after inline actions that should not
   * unmount dashboard sections (e.g. cancel recurring from Fixed payments modal).
   */
  quiet?: boolean
}

export function useDashboardData(selectedDate: Date, selectedPeriod?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { filters } = useSearch()

  const loadData = useCallback(async (options?: LoadDashboardOptions) => {
    if (!user?.token) return
    const quiet = options?.quiet === true
    if (!quiet) setLoading(true)
    try {
      if (hasActiveFilters(filters)) {
        const filtered = await searchTransactions(filters ?? {})
        setTransactions(filtered)
        setMonthSummary(null)
      } else {
        const [transactionsData, summaryData] = await Promise.all([
          listTransactions(),
          getMonthlySummary(selectedDate),
        ])
        setTransactions(transactionsData)
        setMonthSummary(convertMonthlySummary(summaryData))
      }
    } catch (err) {
      console.error(err)
      setTransactions([])
      setMonthSummary(null)
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [user?.token, selectedDate, filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    transactions,
    monthSummary,
    loading,
    loadData,
    filters,
  }
}
