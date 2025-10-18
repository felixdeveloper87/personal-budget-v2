import { 
  Box, 
  Flex, 
  HStack,
  VStack, 
  Text, 
  Badge, 
  useColorModeValue,
  Icon,
  Heading
} from '@chakra-ui/react'
import { Search, Calendar } from 'lucide-react'
import { memo } from 'react'
import { formatTransactionDate } from '../../utils/dateTime'
import { getGradients } from '../ui'
import { SearchSummaryHeaderProps } from '../../types'

const SearchSummaryHeader = memo(function SearchSummaryHeader({
  searchFilters
}: SearchSummaryHeaderProps) {
  const gradients = getGradients()
  const hasActiveFilters = searchFilters.text || searchFilters.type || searchFilters.category || searchFilters.startDate || searchFilters.endDate

  return (
    <Box 
      p={{ base: 4, sm: 5, md: 6 }} 
      borderBottom="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="relative"
      bg={gradients.background}
      sx={{
        // Safe area support for iPhone 14 Pro
        paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
      }}
    >
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        align="center"
        justify="space-between"
        gap={4}
      >
        <HStack spacing={4} align="center">
          <Box
            p={3}
            borderRadius="2xl"
            bg={useColorModeValue(
              'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              'linear-gradient(135deg, #60a5fa, #3b82f6)'
            )}
            boxShadow="lg"
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
          <VStack align="start" spacing={1}>
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

        {/* Active Filters */}
        {hasActiveFilters && (
          <HStack spacing={2} flexWrap="wrap" justify="flex-end">
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
      </Flex>
    </Box>
  )
})

export default SearchSummaryHeader
