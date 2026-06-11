import { useMemo } from 'react'
import { Box, VStack, useColorModeValue } from '@chakra-ui/react'
import SearchHeader from './SearchHeader'
import SearchFilters from './SearchFilters'
import SearchFooter from './SearchFooter'
import SearchResultsModal from './SearchResultsModal'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import { useAuth } from '../../contexts/AuthContext'
import { SearchModalProps } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'
import { Search } from '../ui/icons'

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

  // intentionally not propagating onSearch here — the filters modal is hidden
  // (isOpen={isOpen && !showResults}) while the SearchResultsModal is shown, so
  // only one Chakra modal is mounted at a time. Stacking two modals broke scroll
  // inside the top one: the underlying modal's scroll-lock (react-remove-scroll)
  // does not whitelist the results modal's container.
  void onSearch

  return (
    <>
      <PremiumModal
        isOpen={isOpen && !showResults}
        onClose={onClose}
        size={{ base: 'full', sm: 'lg', md: 'xl', lg: '2xl' }}
        header={
          <ModalHeader
            icon={Search}
            title="Search transactions"
            caption="Filter by text, type, category or date"
            onClose={onClose}
            accent="blue"
          />
        }
        footer={
          <SearchFooter
            onClearAll={resetFilters}
            onSearch={handleSearch}
            hasFilters={hasFilters}
          />
        }
        contentProps={{
          bg: surfaceBg,
          w: { base: 'calc(100% - 24px)', sm: 'auto' },
          h: { base: 'auto', sm: 'auto' },
          maxH: { base: 'calc(100dvh - 24px)', sm: 'calc(100dvh - 48px)' },
          mx: { base: 3, sm: 0 },
          my: { base: 3, sm: 0 },
          borderRadius: { base: '2xl', md: '3xl' },
        }}
      >
        <Box
          bg={surfaceBg}
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: 5 }}
        >
          <VStack spacing={{ base: 5, sm: 6 }} align="stretch">
            <SearchHeader
              searchText={filters.text}
              onSearchTextChange={(v) => updateFilter('text', v)}
            />
            <SearchFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onTypeChange={handleTypeChange}
              availableCategories={getAvailableCategories()}
            />
          </VStack>
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
