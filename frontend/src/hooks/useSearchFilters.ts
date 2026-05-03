import { useState, useEffect } from 'react'
import {
  getAllExpenseCategoryLabels,
  getAllIncomeCategoryLabels,
} from '../constants/transactionCategories'
import { SearchFilters } from '../types'

export const useSearchFilters = (isOpen: boolean) => {
  const [filters, setFilters] = useState<SearchFilters>({
    text: '',
    type: null,
    category: '',
    startDate: '',
    endDate: ''
  })

  const [showResults, setShowResults] = useState(false)

  // Primary + Others-sub options (matches `transactionCategories.ts` / `CategorySelector`).
  const incomeCategories = getAllIncomeCategoryLabels()
  const expenseCategories = getAllExpenseCategoryLabels()

  // Reset filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetFilters()
    }
  }, [isOpen])

  const resetFilters = () => {
    setFilters({
      text: '',
      type: null,
      category: '',
      startDate: '',
      endDate: ''
    })
    setShowResults(false)
  }

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleTypeChange = (newType: 'income' | 'expense' | null) => {
    updateFilter('type', newType)
    // Clear category when type changes to avoid inconsistencies
    updateFilter('category', '')
  }

  const handleSearch = () => {
    setShowResults(true)
  }

  const getAvailableCategories = () => {
    return filters.type === 'income' ? incomeCategories : expenseCategories
  }

  return {
    filters,
    showResults,
    setShowResults,
    resetFilters,
    updateFilter,
    handleTypeChange,
    handleSearch,
    getAvailableCategories,
    incomeCategories,
    expenseCategories
  }
}
