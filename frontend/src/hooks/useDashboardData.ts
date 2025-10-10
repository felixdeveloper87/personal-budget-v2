import { useEffect, useState, useCallback } from 'react'
import { Transaction, MonthlySummary } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useSearch } from '../contexts/SearchContext'
import { getMonthlySummary, listTransactions, searchTransactions } from '../api'
import { convertMonthlySummary } from '../utils/summary'
import { hasActiveFilters } from '../utils/filters'

export function useDashboardData(selectedDate: Date, selectedPeriod?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { filters } = useSearch()

  const loadData = useCallback(async () => {
    if (!user?.token) return
    setLoading(true)
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
      setLoading(false)
    }
  }, [user?.token, selectedDate, filters]) // ✅ Removido selectedPeriod - não precisa recarregar

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
