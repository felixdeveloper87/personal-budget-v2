import { createContext, useContext, useState, ReactNode } from 'react'
import { Transaction } from '../types'
import { searchTransactions } from '../api'
import { useAuth } from './AuthContext'

export interface SearchFilters {
  text?: string
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
}

interface SearchContextValue {
  filters: SearchFilters | null
  results: Transaction[]
  isSearching: boolean
  setFilters: (filters: SearchFilters | null) => void
  runSearch: (filters: SearchFilters) => Promise<void>
  clearSearch: () => void
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [filters, setFilters] = useState<SearchFilters | null>(null)
  const [results, setResults] = useState<Transaction[]>([])
  const [isSearching, setIsSearching] = useState(false)

  async function runSearch(newFilters: SearchFilters) {
    if (!user?.token) return
    setIsSearching(true)
    setFilters(newFilters)
    try {
      const data = await searchTransactions(newFilters, user.token)
      setResults(data)
    } catch (err) {
      console.error('Erro ao buscar transações', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  function clearSearch() {
    setFilters(null)
    setResults([])
  }

  return (
    <SearchContext.Provider value={{ filters, results, isSearching, setFilters, runSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch precisa estar dentro de SearchProvider')
  return ctx
}
