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
import { ChevronDown, ChevronUp } from '../ui/icons'
import { useThemeColors } from '../../hooks/useThemeColors'

interface CategoryTransactionDropdownProps {
  category: string
  amount: number
  percentage: number | string
  color: string
  transactions: any[]
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

function transactionDate(transaction: any): Date {
  return new Date(transaction.paymentDate || transaction.transactionDate || transaction.dateTime)
}

export default function CategoryTransactionDropdown({
  category,
  amount,
  percentage,
  color,
  transactions,
  accentScheme,
  borderColor,
  badgeBg,
  amountColor,
  showProgress = false,
  isExpanded,
  onToggle,
  initialVisibleCount = PAGE_SIZE,
}: CategoryTransactionDropdownProps) {
  const colors = useThemeColors()
  const [internalExpanded, setInternalExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)

  const surfaceBg = useColorModeValue('white', 'whiteAlpha.50')
  const fallbackBorder = useColorModeValue('gray.200', 'whiteAlpha.100')
  const activeBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const neutralHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const fallbackBadgeBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const rowBg = useColorModeValue('white', 'whiteAlpha.50')
  const rowBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const progressBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accentTint = useColorModeValue(`${color}14`, `${color}24`)
  const actionColor = useColorModeValue('gray.700', 'gray.200')

  const expanded = isExpanded ?? internalExpanded
  const percentageValue = typeof percentage === 'number' ? percentage : Number(percentage)
  const percentageLabel = Number.isFinite(percentageValue) ? percentageValue.toFixed(1) : '0.0'

  const sortedTransactions = useMemo(
    () =>
      transactions
        .slice()
        .sort((a, b) => transactionDate(b).getTime() - transactionDate(a).getTime()),
    [transactions],
  )

  useEffect(() => {
    if (!expanded) {
      setVisibleCount(initialVisibleCount)
    }
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
      borderRadius="lg"
      border="1px solid"
      borderColor={expanded ? activeBorder : borderColor ?? fallbackBorder}
      bg={surfaceBg}
      data-accent-scheme={accentScheme}
      boxShadow={expanded ? `inset 3px 0 0 ${color}` : 'none'}
      transition="background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease"
      _hover={{
        bg: neutralHoverBg,
        borderColor: activeBorder,
      }}
      overflow="hidden"
    >
      <Box
        as="button"
        type="button"
        w="full"
        p={3}
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
              w={3.5}
              h={3.5}
              borderRadius={showProgress ? 'full' : 'sm'}
              bg={accentTint}
              border="1px solid"
              borderColor={color}
              flexShrink={0}
            />
            <VStack align="flex-start" spacing={0} minW={0}>
              <Text fontSize="sm" fontWeight={600} color={colors.text.primary} isTruncated>
                {category}
              </Text>
              <Text fontSize="2xs" color={mutedColor}>
                {sortedTransactions.length} transaction{sortedTransactions.length === 1 ? '' : 's'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3} align="center" flexShrink={0}>
            <Text fontSize="sm" fontWeight={700} color={amountColor ?? colors.text.primary}>
              £{amount.toFixed(2)}
            </Text>
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg={badgeBg ?? fallbackBadgeBg}
              color={mutedColor}
              fontSize="xs"
              fontWeight={600}
              textTransform="none"
              letterSpacing="0"
            >
              {percentageLabel}%
            </Badge>
            <Icon as={expanded ? ChevronUp : ChevronDown} boxSize={4} color={mutedColor} />
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
        <VStack align="stretch" spacing={1.5} px={3} pb={3}>
          {visibleTransactions.map((transaction) => (
            <HStack
              key={transaction.id ?? `${transaction.description}-${transaction.dateTime}-${transaction.amount}`}
              justify="space-between"
              align="center"
              gap={3}
              px={3}
              py={2}
              bg={rowBg}
              border="1px solid"
              borderColor={rowBorder}
              borderRadius="md"
              _hover={{ bg: rowHoverBg }}
            >
              <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                <Text fontSize="xs" fontWeight={700} color={colors.text.primary} noOfLines={1}>
                  {transaction.description || 'No description'}
                </Text>
                <Text fontSize="2xs" color={mutedColor}>
                  {transactionDate(transaction).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </VStack>
              <Text fontSize="xs" fontWeight={800} color={amountColor ?? colors.text.primary} flexShrink={0}>
                £{Number(transaction.amount || 0).toFixed(2)}
              </Text>
            </HStack>
          ))}

          {remainingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              color={actionColor}
              fontSize="xs"
              fontWeight={700}
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              _hover={{ bg: neutralHoverBg }}
            >
              Show {Math.min(PAGE_SIZE, remainingCount)} more
            </Button>
          )}
        </VStack>
      </Collapse>
    </Box>
  )
}
