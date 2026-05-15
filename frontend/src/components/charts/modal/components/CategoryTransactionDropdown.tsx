import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Collapse,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp } from '../../../ui/icons'
import { useThemeColors } from '../../../../hooks/useThemeColors'

interface CategoryTransactionDropdownProps {
  category: string
  amount: number
  percentage: string
  color: string
  transactions: any[]
  borderColor: string
  hoverBg: string
  badgeBg: string
  accentScheme: 'green' | 'red'
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
  borderColor,
  hoverBg,
  badgeBg,
  accentScheme,
}: CategoryTransactionDropdownProps) {
  const colors = useThemeColors()
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const rowBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  const sortedTransactions = useMemo(
    () =>
      transactions
        .slice()
        .sort((a, b) => transactionDate(b).getTime() - transactionDate(a).getTime()),
    [transactions],
  )

  const visibleTransactions = sortedTransactions.slice(0, visibleCount)
  const remainingCount = Math.max(0, sortedTransactions.length - visibleCount)

  return (
    <Box
      borderRadius="lg"
      border="1px solid"
      borderColor={isExpanded ? color : borderColor}
      transition="background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease"
      _hover={{
        bg: hoverBg,
        transform: 'translateX(2px)',
        borderColor: color,
      }}
      overflow="hidden"
    >
      <HStack
        as="button"
        type="button"
        w="full"
        justify="space-between"
        align="center"
        p={3}
        textAlign="left"
        onClick={() => setIsExpanded((value) => !value)}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: color,
          outlineOffset: '2px',
        }}
      >
        <HStack spacing={3} align="center" minW={0} flex={1}>
          <Box w={3.5} h={3.5} borderRadius="sm" bg={color} flexShrink={0} />
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
          <Text fontSize="sm" fontWeight={700} color={colors.text.primary}>
            £{amount.toFixed(2)}
          </Text>
          <Badge
            px={2}
            py={0.5}
            borderRadius="full"
            bg={badgeBg}
            color={colors.text.primary}
            fontSize="xs"
            fontWeight={600}
          >
            {percentage}%
          </Badge>
          <Icon as={isExpanded ? ChevronUp : ChevronDown} boxSize={4} color={mutedColor} />
        </HStack>
      </HStack>

      <Collapse in={isExpanded} animateOpacity>
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
              <Text fontSize="xs" fontWeight={800} color={colors.text.primary} flexShrink={0}>
                £{Number(transaction.amount || 0).toFixed(2)}
              </Text>
            </HStack>
          ))}

          {remainingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme={accentScheme}
              fontSize="xs"
              fontWeight={700}
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Show {Math.min(PAGE_SIZE, remainingCount)} more
            </Button>
          )}
        </VStack>
      </Collapse>
    </Box>
  )
}
