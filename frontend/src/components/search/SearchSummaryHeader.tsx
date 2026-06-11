import { memo } from 'react'
import {
  Icon,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { Calendar, Search, TrendingDown, TrendingUp } from '../ui/icons'
import { formatTransactionDate } from '../../utils/dateTime'
import { SearchSummaryHeaderProps } from '../../types'

/**
 * Compact "active filters" bar shown at the top of the results modal body.
 *
 * The title / count / close button now live in the shared <ModalHeader/> so the
 * results modal shares the same header look as every other modal in the app.
 * Renders nothing when no filter is active.
 */
const SearchSummaryHeader = memo(function SearchSummaryHeader({
  searchFilters,
}: SearchSummaryHeaderProps) {
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

  if (!hasActiveFilters) return null

  return (
    <Wrap spacing={2} mb={4}>
      {searchFilters.text && (
        <WrapItem>
          <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={2.5} py={1}>
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
            px={2.5}
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
          <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={2.5} py={1}>
            <TagLabel>{searchFilters.category}</TagLabel>
          </Tag>
        </WrapItem>
      )}
      {(searchFilters.startDate || searchFilters.endDate) && (
        <WrapItem>
          <Tag size="sm" bg={tagBg} color={tagColor} borderRadius="full" px={2.5} py={1}>
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
  )
})

export default SearchSummaryHeader
