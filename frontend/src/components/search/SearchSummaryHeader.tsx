import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
  Icon,
  Heading,
  Button
} from '@chakra-ui/react'
import { Search, Calendar, X } from 'lucide-react'
import { memo } from 'react'
import { formatTransactionDate } from '../../utils/dateTime'
import { getGradients, getModalHeaderStyles } from '../ui'
import { SearchSummaryHeaderProps } from '../../types'

const SearchSummaryHeader = memo(function SearchSummaryHeader({
  searchFilters,
  onClose
}: SearchSummaryHeaderProps & { onClose?: () => void }) {
  const gradients = getGradients()
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  const hasActiveFilters = searchFilters.text || searchFilters.type || searchFilters.category || searchFilters.startDate || searchFilters.endDate

  return (
    <Box
      p={{ base: 4, sm: 5, md: 6 }}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="relative"
      bg={gradients.background}
      sx={{
        // Safe area support handled by PremiumModal
      }}
    >
      {/* Header with title and close button */}
      <HStack
        spacing={{ base: 2, sm: 3 }}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        pr={{ base: 2, sm: 4 }}
        pt={{ base: 2, sm: 0 }}
        mb={hasActiveFilters ? 4 : 0}
      >
        {/* Logo + Text */}
        <HStack spacing={4} align="center" flex="1" minW={0}>
          <Box
            p={3}
            borderRadius="2xl"
            bg={useColorModeValue(
              'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              'linear-gradient(135deg, #60a5fa, #3b82f6)'
            )}
            boxShadow="lg"
            flexShrink={0}
            sx={{
              animation: 'glow 3s ease-in-out infinite',
              '@keyframes glow': {
                '0%, 100%': {
                  boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)'
                },
                '50%': {
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
                }
              }
            }}
          >
            <Icon as={Search} boxSize={6} color="white" />
          </Box>
          <VStack align="start" spacing={1} flex="1" minW={0}>
            <Heading
              size={{ base: 'md', sm: 'lg' }}
              bg={useColorModeValue(
                'linear-gradient(135deg, #0f172a, #1e293b)',
                'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              )}
              bgClip="text"
              fontWeight="800"
            >
              Search Results
            </Heading>
            <Text
              fontSize={{ base: 'xs', sm: 'sm' }}
              color={useColorModeValue('gray.700', 'gray.200')}
              fontWeight="500"
            >
              {hasActiveFilters ? 'Filtered transactions' : 'All transactions'}
            </Text>
          </VStack>
        </HStack>
        {/* Close Button */}
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            bg={useColorModeValue(headerStyles.closeButton.bg.light, headerStyles.closeButton.bg.dark)}
            border="1px solid"
            borderColor={useColorModeValue(headerStyles.closeButton.borderColor.light, headerStyles.closeButton.borderColor.dark)}
            borderRadius={headerStyles.closeButton.borderRadius}
            p={headerStyles.closeButton.p}
            _hover={headerStyles.closeButton._hover}
            transition={headerStyles.closeButton.transition}
            flexShrink={0}
          >
            <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={useColorModeValue(headerStyles.closeButton.iconColor.light, headerStyles.closeButton.iconColor.dark)} />
          </Button>
        )}
      </HStack>

      {/* Active Filters */}
      {hasActiveFilters && (
        <HStack spacing={2} flexWrap="wrap" justify="flex-start" mt={2}>
          {searchFilters.text && (
            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Text: "{searchFilters.text}"
            </Badge>
          )}
          {searchFilters.type && (
            <Badge
              colorScheme={searchFilters.type === 'income' ? 'green' : 'red'}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
            >
              {searchFilters.type === 'income' ? 'Income' : 'Expense'}
            </Badge>
          )}
          {searchFilters.category && (
            <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
              {searchFilters.category}
            </Badge>
          )}
          {(searchFilters.startDate || searchFilters.endDate) && (
            <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
              <HStack spacing={1}>
                <Icon as={Calendar} boxSize={3} />
                <Text>
                  {searchFilters.startDate && searchFilters.endDate
                    ? `${formatTransactionDate(searchFilters.startDate)} - ${formatTransactionDate(searchFilters.endDate)}`
                    : searchFilters.startDate
                      ? `From ${formatTransactionDate(searchFilters.startDate)}`
                      : `Until ${formatTransactionDate(searchFilters.endDate)}`
                  }
                </Text>
              </HStack>
            </Badge>
          )}
        </HStack>
      )}
    </Box>
  )
})

export default SearchSummaryHeader
