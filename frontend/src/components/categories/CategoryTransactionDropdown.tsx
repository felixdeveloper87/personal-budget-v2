import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Collapse,
  HStack,
  Icon,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { Transaction } from '../../types'
import { getTransactionDate } from '../../utils/transactionDates'
import TransactionLedgerRow from '../transactions/TransactionLedgerRow'
import { ChevronDown, ChevronUp } from '../ui/icons'

interface CategoryTransactionDropdownProps {
  category: string
  amount: number
  percentage: number | string
  color: string
  transactions: Transaction[]
  accentScheme: 'green' | 'red'
  borderColor?: string
  hoverBg?: string
  badgeBg?: string
  amountColor?: string
  showProgress?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  initialVisibleCount?: number
}

const PAGE_SIZE = 5
const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default function CategoryTransactionDropdown({
  category,
  amount,
  percentage,
  color,
  transactions,
  accentScheme,
  borderColor,
  hoverBg,
  badgeBg,
  amountColor,
  showProgress = false,
  isExpanded,
  onToggle,
  initialVisibleCount = PAGE_SIZE,
}: CategoryTransactionDropdownProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)

  const surfaceBg = useColorModeValue('white', 'whiteAlpha.50')
  const fallbackBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const activeBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const neutralHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const fallbackBadgeBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const expandedBg = useColorModeValue('gray.50', 'blackAlpha.300')
  const rowBg = useColorModeValue('white', 'whiteAlpha.50')
  const rowBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const progressBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accentTint = useColorModeValue(`${color}14`, `${color}24`)
  const actionColor = useColorModeValue('gray.700', 'gray.200')
  const expandedShadow = useColorModeValue(
    '0 8px 24px -18px rgba(15, 23, 42, 0.35)',
    '0 8px 24px -18px rgba(0, 0, 0, 0.8)',
  )

  const expanded = isExpanded ?? internalExpanded
  const percentageValue = typeof percentage === 'number' ? percentage : Number(percentage)
  const percentageLabel = Number.isFinite(percentageValue) ? percentageValue.toFixed(1) : '0.0'
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          getTransactionDate(b, 'activity').getTime() -
          getTransactionDate(a, 'activity').getTime(),
      ),
    [transactions],
  )

  useEffect(() => {
    if (!expanded) setVisibleCount(initialVisibleCount)
  }, [expanded, initialVisibleCount])

  const visibleTransactions = sortedTransactions.slice(0, visibleCount)
  const remainingCount = Math.max(0, sortedTransactions.length - visibleCount)

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
      return
    }
    setInternalExpanded((value) => !value)
  }

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={expanded ? activeBorder : borderColor ?? fallbackBorder}
      bg={surfaceBg}
      data-accent-scheme={accentScheme}
      boxShadow={expanded ? expandedShadow : 'none'}
      transition="background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={{ bg: hoverBg ?? neutralHoverBg, borderColor: activeBorder }}
      overflow="hidden"
    >
      <Box
        as="button"
        type="button"
        w="full"
        px={{ base: 3, md: 4 }}
        py={3.5}
        textAlign="left"
        onClick={handleToggle}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: color,
          outlineOffset: '2px',
        }}
      >
        <HStack justify="space-between" align="center" gap={3}>
          <HStack spacing={3} align="center" minW={0} flex={1}>
            <Box
              w={2.5}
              h={2.5}
              borderRadius="full"
              bg={color}
              boxShadow={`0 0 0 4px ${accentTint}`}
              flexShrink={0}
            />
            <VStack align="flex-start" spacing={0.5} minW={0}>
              <Text fontSize="sm" fontWeight={700} color={titleColor} isTruncated>
                {category}
              </Text>
              <Text fontSize="xs" color={mutedColor}>
                {sortedTransactions.length} transaction{sortedTransactions.length === 1 ? '' : 's'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={{ base: 2, md: 3 }} align="center" flexShrink={0}>
            <Text fontSize="sm" fontWeight={800} color={amountColor ?? titleColor}>
              {currencyFormatter.format(amount)}
            </Text>
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg={badgeBg ?? fallbackBadgeBg}
              color={mutedColor}
              fontSize="2xs"
              fontWeight={700}
              textTransform="none"
            >
              {percentageLabel}%
            </Badge>
            <Box
              w={7}
              h={7}
              borderRadius="md"
              bg={expanded ? fallbackBadgeBg : 'transparent'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={expanded ? ChevronUp : ChevronDown} boxSize={3.5} color={mutedColor} />
            </Box>
          </HStack>
        </HStack>

        {showProgress && (
          <Progress
            value={percentageValue}
            size="sm"
            borderRadius="full"
            bg={progressBg}
            mt={3}
            sx={{
              '& > div': {
                background: `linear-gradient(90deg, ${color} 0%, ${color}B3 100%)`,
                borderRadius: 'full',
              },
            }}
          />
        )}
      </Box>

      <Collapse in={expanded} animateOpacity>
        <VStack
          align="stretch"
          spacing={0}
          px={{ base: 2.5, md: 3 }}
          py={3}
          bg={expandedBg}
          borderTop="1px solid"
          borderTopColor={rowBorder}
        >
          <Box
            bg={rowBg}
            border="1px solid"
            borderColor={rowBorder}
            borderRadius="xl"
            overflow="hidden"
          >
            {visibleTransactions.map((transaction, index) => (
              <TransactionLedgerRow
                key={transaction.id ?? `${transaction.description}-${transaction.dateTime}-${transaction.amount}`}
                transaction={transaction}
                dateBasis="activity"
                showCategory={false}
                withTopBorder={index > 0}
              />
            ))}
          </Box>

          {remainingCount > 0 && (
            <Button
              mt={2}
              size="sm"
              variant="outline"
              color={actionColor}
              borderColor={rowBorder}
              bg={rowBg}
              fontSize="xs"
              fontWeight={700}
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              _hover={{ bg: neutralHoverBg, borderColor: activeBorder }}
            >
              Show {Math.min(PAGE_SIZE, remainingCount)} more
            </Button>
          )}
        </VStack>
      </Collapse>
    </Box>
  )
}
