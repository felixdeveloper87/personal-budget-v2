import {
  VStack,
  Text,
  useColorModeValue,
  Box,
  HStack,
  Icon,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { Search, TrendingUp, TrendingDown, ChevronDown, ChevronUp, List } from '../ui/icons'
import { memo, useMemo, useState, useCallback } from 'react'
import CategoryResultCard from './CategoryResultCard'
import { Transaction } from '../../types'
import { CategoryResultsListProps } from '../../types'

const CategoryResultsList = memo(function CategoryResultsList({
  transactions,
}: CategoryResultsListProps) {
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const subtleColor = useColorModeValue('gray.500', 'gray.400')
  const emptyIconBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  // income stat
  const incomeBg = useColorModeValue('green.50', 'rgba(34,197,94,0.10)')
  const incomeBorder = useColorModeValue('green.200', 'rgba(74,222,128,0.25)')
  const incomeColor = useColorModeValue('green.700', 'green.300')
  // expense stat
  const expenseBg = useColorModeValue('red.50', 'rgba(239,68,68,0.10)')
  const expenseBorder = useColorModeValue('red.200', 'rgba(248,113,113,0.25)')
  const expenseColor = useColorModeValue('red.700', 'red.300')
  // net stat
  const netBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.10)')
  const netBorder = useColorModeValue('blue.200', 'rgba(96,165,250,0.25)')
  const netColor = useColorModeValue('blue.700', 'blue.300')
  // expand/collapse
  const ctrlBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const ctrlColor = useColorModeValue('gray.600', 'gray.400')
  const ctrlHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}
    transactions.forEach((t) => {
      const key = `${t.type}-${t.category}`
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups).sort(([, a], [, b]) => {
      const totalA = a.reduce((sum, t) => sum + t.amount, 0)
      const totalB = b.reduce((sum, t) => sum + t.amount, 0)
      return totalB - totalA
    })
  }, [transactions])

  const { incomeTotal, expenseTotal } = useMemo(() => {
    let inc = 0
    let exp = 0
    transactions.forEach((t) => {
      if (t.type === 'INCOME') inc += t.amount
      else exp += Math.abs(t.amount)
    })
    return { incomeTotal: inc, expenseTotal: exp }
  }, [transactions])

  const net = incomeTotal - expenseTotal

  const toggleCategory = useCallback((key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(groupedTransactions.map(([k]) => k)))
  }, [groupedTransactions])

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set())
  }, [])

  const allExpanded =
    groupedTransactions.length > 0 &&
    groupedTransactions.every(([k]) => expandedCategories.has(k))

  if (transactions.length === 0) {
    return (
      <Box textAlign="center" py={{ base: 10, md: 14 }}>
        <Box
          w={14}
          h={14}
          borderRadius="2xl"
          bg={emptyIconBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={4}
        >
          <Icon as={Search} boxSize={6} color={subtleColor} />
        </Box>
        <Text fontSize="md" fontWeight={700} color={textColor} mb={1.5}>
          No transactions found
        </Text>
        <Text fontSize="sm" color={subtleColor} maxW="xs" mx="auto">
          Try different keywords, a broader date range, or clear some filters.
        </Text>
      </Box>
    )
  }

  return (
    <VStack spacing={3} align="stretch" w="full">
      {/* Summary stats pills */}
      <Wrap spacing={2}>
        {incomeTotal > 0 && (
          <WrapItem>
            <HStack
              spacing={1.5}
              bg={incomeBg}
              border="1px solid"
              borderColor={incomeBorder}
              color={incomeColor}
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight={700}
            >
              <Icon as={TrendingUp} boxSize={3.5} />
              <Text>+£{incomeTotal.toFixed(2)}</Text>
            </HStack>
          </WrapItem>
        )}
        {expenseTotal > 0 && (
          <WrapItem>
            <HStack
              spacing={1.5}
              bg={expenseBg}
              border="1px solid"
              borderColor={expenseBorder}
              color={expenseColor}
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight={700}
            >
              <Icon as={TrendingDown} boxSize={3.5} />
              <Text>-£{expenseTotal.toFixed(2)}</Text>
            </HStack>
          </WrapItem>
        )}
        {incomeTotal > 0 && expenseTotal > 0 && (
          <WrapItem>
            <HStack
              spacing={1.5}
              bg={netBg}
              border="1px solid"
              borderColor={netBorder}
              color={netColor}
              px={3}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight={700}
            >
              <Text>Net: {net >= 0 ? '+' : ''}£{Math.abs(net).toFixed(2)}</Text>
            </HStack>
          </WrapItem>
        )}
      </Wrap>

      {/* Header row */}
      <HStack justify="space-between" align="center">
        <HStack spacing={2}>
          <Icon as={List} boxSize={3.5} color={subtleColor} />
          <Text fontSize="sm" fontWeight={700} color={textColor}>
            {groupedTransactions.length}{' '}
            {groupedTransactions.length === 1 ? 'category' : 'categories'}
          </Text>
        </HStack>

        {groupedTransactions.length > 1 && (
          <Button
            variant="outline"
            size="xs"
            h="28px"
            px={3}
            fontSize="xs"
            fontWeight={600}
            borderRadius="lg"
            borderColor={ctrlBorder}
            color={ctrlColor}
            rightIcon={
              <Icon as={allExpanded ? ChevronUp : ChevronDown} boxSize={3} />
            }
            onClick={allExpanded ? collapseAll : expandAll}
            _hover={{ bg: ctrlHoverBg }}
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </Button>
        )}
      </HStack>

      {/* Category cards */}
      {groupedTransactions.map(([categoryKey, categoryTransactions]) => {
        const [type, category] = categoryKey.split('-', 2)
        return (
          <CategoryResultCard
            key={categoryKey}
            category={category}
            transactions={categoryTransactions}
            type={type as 'INCOME' | 'EXPENSE'}
            isExpanded={expandedCategories.has(categoryKey)}
            onToggle={() => toggleCategory(categoryKey)}
          />
        )
      })}
    </VStack>
  )
})

export default CategoryResultsList
