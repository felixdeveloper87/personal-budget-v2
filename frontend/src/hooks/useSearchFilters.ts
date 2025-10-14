import { useState, useEffect } from 'react'

export interface SearchFilters {
  text: string
  type: 'income' | 'expense' | null
  category: string
  startDate: string
  endDate: string
}

export const useSearchFilters = (isOpen: boolean) => {
  const [filters, setFilters] = useState<SearchFilters>({
    text: '',
    type: null,
    category: '',
    startDate: '',
    endDate: ''
  })

  const [showResults, setShowResults] = useState(false)

  // Predefined categories
  const incomeCategories = [
    'Salary', 'Freelance', 'Investments', 'Business', 'Rental', 'Bonus', 'Refund', 'Others'
  ]
  
  const expenseCategories = [
    'Groceries', 'Rent', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Shopping', 'Others'
  ]

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
