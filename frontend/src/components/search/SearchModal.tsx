import {
  Box,
  useColorModeValue
} from '@chakra-ui/react'
import SearchResultsModal from './SearchResultsModal'
import SearchHeader from './SearchHeader'
import SearchFilters from './SearchFilters'
import SearchFooter from './SearchFooter'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import { useAuth } from '../../contexts/AuthContext'
import { SearchModalProps } from '../../types'
import { safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles, PremiumModal } from '../ui'

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const { user } = useAuth()
  const responsiveStyles = getResponsiveStyles()
  const {
    filters,
    showResults,
    setShowResults,
    resetFilters,
    updateFilter,
    handleTypeChange,
    handleSearch,
    getAvailableCategories
  } = useSearchFilters(isOpen)

  const handleSearchClick = () => {
    handleSearch()
    // Don't call onSearch here to avoid closing the SearchModal
    // onSearch(filters)
  }

  const handleClearAll = () => {
    resetFilters()
    // Don't call onSearch to avoid closing the modal
    // Just clear filters locally
  }
  const cardBg = useColorModeValue('gray.50', 'black')

  // Wrapper for SearchHeader to override padding if needed or just pass as is
  // Since PremiumModal adds padding to the header container, and SearchHeader also has padding,
  // we might want to adjust. However, SearchHeader uses getModalHeaderStyles which might be consistent.
  // Let's pass it directly for now.

  return (
    <>
      <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
        header={<SearchHeader onClose={onClose} />}
        footer={
          <SearchFooter
            onClearAll={handleClearAll}
            onSearch={handleSearchClick}
          />
        }
        contentProps={{
          bg: cardBg,
        }}
      >
        {/* Modal content - Scrollable */}
        <Box
          flex="1"
          p={responsiveStyles.spacing.container}
          overflowY="auto"
          {...responsiveStyles.content}
          sx={{
            ...safeAreaStyles.content,
            ...safariStyles.scrollable,
            ...getScrollbarStyles(useColorModeValue)
          }}
        >
          <SearchFilters
            filters={filters}
            onUpdateFilter={updateFilter}
            onTypeChange={handleTypeChange}
            availableCategories={getAvailableCategories()}
          />
        </Box>
      </PremiumModal>

      {/* Search Results Modal - Inside SearchModal */}
      <SearchResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchFilters={filters}
        user={user || undefined}
      />
    </>
  )
}