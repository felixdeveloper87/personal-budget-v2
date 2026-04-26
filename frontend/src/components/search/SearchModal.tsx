import { useMemo } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import SearchHeader from './SearchHeader'
import SearchFilters from './SearchFilters'
import SearchFooter from './SearchFooter'
import SearchResultsModal from './SearchResultsModal'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import { useAuth } from '../../contexts/AuthContext'
import { SearchModalProps } from '../../types'
import { PremiumModal } from '../ui'

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const { user } = useAuth()
  const {
    filters,
    showResults,
    setShowResults,
    resetFilters,
    updateFilter,
    handleTypeChange,
    handleSearch,
    getAvailableCategories,
  } = useSearchFilters(isOpen)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')

  const hasFilters = useMemo(
    () =>
      Boolean(
        filters.text ||
          filters.type ||
          filters.category ||
          filters.startDate ||
          filters.endDate,
      ),
    [filters],
  )

  // intentionally not propagating onSearch here — the SearchModal stays open
  // while the SearchResultsModal opens on top, matching the previous flow.
  void onSearch

  return (
    <>
      <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', sm: 'lg', md: 'xl', lg: '2xl' }}
        header={
          <SearchHeader
            onClose={onClose}
            searchText={filters.text}
            onSearchTextChange={(v) => updateFilter('text', v)}
          />
        }
        footer={
          <SearchFooter
            onClearAll={resetFilters}
            onSearch={handleSearch}
            hasFilters={hasFilters}
          />
        }
        contentProps={{ bg: surfaceBg }}
      >
        <Box
          flex="1"
          bg={surfaceBg}
          px={{ base: 5, sm: 6 }}
          py={{ base: 5, sm: 6 }}
          overflowY="auto"
        >
          <SearchFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onTypeChange={handleTypeChange}
            availableCategories={getAvailableCategories()}
          />
        </Box>
      </PremiumModal>

      <SearchResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchFilters={filters}
        user={user || undefined}
      />
    </>
  )
}
