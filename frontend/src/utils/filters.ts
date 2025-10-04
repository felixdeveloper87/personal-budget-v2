import { SearchFilters } from '../contexts/SearchContext'

/**
 * Retorna true se houver algum filtro ativo.
 */
export function hasActiveFilters(filters?: SearchFilters | null): boolean {
  if (!filters) return false

  return (
    !!filters.text ||
    !!filters.type ||
    !!filters.category ||
    !!filters.startDate ||
    !!filters.endDate
  )
}
