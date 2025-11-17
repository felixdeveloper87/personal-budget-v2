import {
  Modal, ModalOverlay, ModalContent, VStack, Box, Card, CardBody, useColorModeValue
} from '@chakra-ui/react'
import SearchResultsModal from './SearchResultsModal'
import SearchHeader from './SearchHeader'
import SearchFilters from './SearchFilters'
import SearchFooter from './SearchFooter'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import { useAuth } from '../../contexts/AuthContext'
import { SearchModalProps } from '../../types'
import { animations, safeAreaStyles, safariStyles, getResponsiveStyles, getShimmerStyles, getScrollbarStyles } from '../ui'

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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }} 
      isCentered
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        bg={cardBg}
        borderRadius={{ base: 'none', md: '3xl' }}
        overflow="hidden"
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal
        }}
      >
        
        {/* Main card with glassmorphism */}
        <Card
          position="relative"
          bg={cardBg}
          shadow="2xl"
          overflow="hidden"
          w="full"
          h="full"
          sx={{
            animation: animations.slideIn,
            '@keyframes slideIn': {
              from: { 
                opacity: 0, 
                transform: 'translateY(20px) scale(0.95)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              }
            }
          }}
        >
          
          <CardBody p={0} display="flex" flexDirection="column" h="full">
            <VStack spacing={0} align="stretch" h="full">
              {/* Header */}
              <SearchHeader onClose={onClose} />

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

              {/* Footer - Fixed at bottom */}
              <Box 
                flexShrink={0}
                position={{ base: 'sticky', sm: 'relative' }}
                bottom={0}
                zIndex={10}
                sx={safariStyles.sticky}
              >
                <SearchFooter
                  onClearAll={handleClearAll}
                  onSearch={handleSearchClick}
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
      
      {/* Search Results Modal - Inside SearchModal */}
      <SearchResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchFilters={filters}
        user={user || undefined}
      />
    </Modal>
  )
}