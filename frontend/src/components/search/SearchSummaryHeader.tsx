import { memo } from 'react'
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Tag,
  TagLabel,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { Calendar, ListFilter, Search, TrendingDown, TrendingUp, X } from 'lucide-react'
import { formatTransactionDate } from '../../utils/dateTime'
import { SearchSummaryHeaderProps } from '../../types'

interface Props extends SearchSummaryHeaderProps {
  onClose?: () => void
  /** Optional total count to display next to the title. */
  resultCount?: number
}

const SearchSummaryHeader = memo(function SearchSummaryHeader({
  searchFilters,
  onClose,
  resultCount,
}: Props) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const closeIdleColor = useColorModeValue('gray.500', 'gray.400')
  const closeHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const accentBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const accentColor = useColorModeValue('blue.600', 'blue.300')
  const tagBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const tagColor = useColorModeValue('gray.700', 'gray.200')
  const incomeColor = useColorModeValue('green.700', 'green.200')
  const incomeBg = useColorModeValue('green.50', 'rgba(34,197,94,0.12)')
  const expenseColor = useColorModeValue('red.700', 'red.200')
  const expenseBg = useColorModeValue('red.50', 'rgba(239,68,68,0.12)')

  const hasActiveFilters = Boolean(
    searchFilters.text ||
      searchFilters.type ||
      searchFilters.category ||
      searchFilters.startDate ||
      searchFilters.endDate,
  )

  const caption =
    typeof resultCount === 'number'
      ? resultCount === 1
        ? '1 transaction found'
        : `${resultCount} transactions found`
      : hasActiveFilters
        ? 'Showing filtered results'
        : 'Showing all transactions'

  return (
    <Box
      bg={surfaceBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, sm: 6 }}
      pt={{
        // Keep the X close button clear of the iOS Dynamic Island / status
        // bar with extra breathing room beyond the raw safe-area inset.
        base: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        sm: 5,
      }}
      pb={hasActiveFilters ? 4 : 5}
    >
      <HStack justify="space-between" align="center" mb={hasActiveFilters ? 3 : 0} spacing={3}>
        <HStack spacing={3} minW={0}>
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={accentBg}
            color={accentColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={ListFilter} boxSize={4} strokeWidth={2.25} />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              fontWeight={700}
              fontSize="md"
              color={titleColor}
              lineHeight="1.2"
              noOfLines={1}
            >
              Results
            </Text>
            <Text fontSize="xs" color={captionColor} noOfLines={1}>
              {caption}
            </Text>
          </VStack>
        </HStack>

        {onClose && (
          <IconButton
            aria-label="Close"
            icon={<Icon as={X} boxSize={4} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
            color={closeIdleColor}
            _hover={{ bg: closeHoverBg, color: titleColor }}
            transition="background-color 0.15s ease, color 0.15s ease"
          />
        )}
      </HStack>

      {hasActiveFilters && (
        <Wrap spacing={2}>
          {searchFilters.text && (
            <WrapItem>
              <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={3} py={1}>
                <Icon as={Search} boxSize={3} mr={1.5} />
                <TagLabel maxW="180px" noOfLines={1}>
                  {searchFilters.text}
                </TagLabel>
              </Tag>
            </WrapItem>
          )}
          {searchFilters.type && (
            <WrapItem>
              <Tag
                size="sm"
                bg={searchFilters.type === 'income' ? incomeBg : expenseBg}
                color={searchFilters.type === 'income' ? incomeColor : expenseColor}
                borderRadius="full"
                px={3}
                py={1}
              >
                <Icon
                  as={searchFilters.type === 'income' ? TrendingUp : TrendingDown}
                  boxSize={3}
                  mr={1.5}
                />
                <TagLabel>{searchFilters.type === 'income' ? 'Income' : 'Expense'}</TagLabel>
              </Tag>
            </WrapItem>
          )}
          {searchFilters.category && (
            <WrapItem>
              <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={3} py={1}>
                <TagLabel>{searchFilters.category}</TagLabel>
              </Tag>
            </WrapItem>
          )}
          {(searchFilters.startDate || searchFilters.endDate) && (
            <WrapItem>
              <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={3} py={1}>
                <Icon as={Calendar} boxSize={3} mr={1.5} />
                <TagLabel>
                  {searchFilters.startDate && searchFilters.endDate
                    ? `${formatTransactionDate(searchFilters.startDate)} – ${formatTransactionDate(searchFilters.endDate)}`
                    : searchFilters.startDate
                      ? `From ${formatTransactionDate(searchFilters.startDate)}`
                      : `Until ${formatTransactionDate(searchFilters.endDate)}`}
                </TagLabel>
              </Tag>
            </WrapItem>
          )}
        </Wrap>
      )}
    </Box>
  )
})

export default SearchSummaryHeader
