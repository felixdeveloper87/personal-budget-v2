import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { PeriodType } from '../../../types'
import type { Transaction } from '../../../types'
import {
  CalendarDays,
  ReceiptText,
  Sparkles,
  Tag,
  TrendingUp,
} from '../../ui/icons'
import type { LucideIcon } from '../../ui/icons'
import { ChartEmptyState, ChartPlotShell, PeriodBucketBarChart } from './components'
import { processCategoriesWithTransactions } from './utils'
import {
  bucketTransactionsByPeriod,
  type PeriodBucket,
} from './utils/periodBuckets'

export interface TransactionsChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  /**
   * When false, period pills inside the plot are hidden (e.g. the Charts page
   * already shows the range in the section header).
   */
  showPeriodBadge?: boolean
  /**
   * When `periodType` and `selectedDate` are provided, the compact period
   * bucket bar chart (today / this week / this month / this year) is
   * rendered. Without these props the chart has nothing to show — the
   * summary KPIs are now hoisted into the section/modal header.
   */
  periodType?: PeriodType
  selectedDate?: Date
}

interface BehaviorInsight {
  icon: LucideIcon
  eyebrow: string
  title: string
  detail: string
  color: string
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

function transactionDate(transaction: Transaction): Date {
  const source = transaction.paymentDate || transaction.transactionDate || transaction.dateTime
  return source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source)
}

function formatShortDate(transaction: Transaction): string {
  return transactionDate(transaction).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

function getCategoryGrowth(expenses: Transaction[]): { category: string; delta: number } | null {
  if (expenses.length < 2) return null

  const timestamps = expenses
    .map((transaction) => transactionDate(transaction).getTime())
    .sort((a, b) => a - b)
  const first = timestamps[0]
  const last = timestamps[timestamps.length - 1]
  if (first === last) return null

  const midpoint = first + (last - first) / 2
  const totals: Record<string, { firstHalf: number; secondHalf: number }> = {}

  expenses.forEach((transaction) => {
    const category = transaction.category || 'Uncategorized'
    if (!totals[category]) {
      totals[category] = { firstHalf: 0, secondHalf: 0 }
    }

    const key = transactionDate(transaction).getTime() <= midpoint ? 'firstHalf' : 'secondHalf'
    totals[category][key] += transaction.amount
  })

  const [growth] = Object.entries(totals)
    .map(([category, total]) => ({
      category,
      delta: total.secondHalf - total.firstHalf,
    }))
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)

  return growth ?? null
}

export default function TransactionsChart({
  transactions,
  selectedPeriod,
  showPeriodBadge = true,
  periodType,
  selectedDate,
}: TransactionsChartProps) {
  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'EXPENSE'),
    [transactions],
  )

  const { sortedCategories: expenseCategories, total: totalExpenses } = useMemo(
    () => processCategoriesWithTransactions(expenseTransactions),
    [expenseTransactions],
  )

  const periodBuckets = useMemo(
    () =>
      periodType && selectedDate
        ? bucketTransactionsByPeriod(transactions, periodType, selectedDate, 'ALL')
        : [],
    [transactions, periodType, selectedDate],
  )

  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null)

  useEffect(() => {
    const currentBucket = periodBuckets.find((bucket) => bucket.key === selectedBucketKey)
    if (currentBucket) return

    const [largestBucket] = [...periodBuckets]
      .filter((bucket) => bucket.transactions.length > 0)
      .sort((a, b) => b.value - a.value)

    setSelectedBucketKey(largestBucket?.key ?? null)
  }, [periodBuckets, selectedBucketKey])

  const selectedBucket = useMemo(
    () => periodBuckets.find((bucket) => bucket.key === selectedBucketKey) ?? null,
    [periodBuckets, selectedBucketKey],
  )

  const selectedBucketTransactions = useMemo(
    () =>
      selectedBucket
        ? [...selectedBucket.transactions].sort(
            (a, b) => transactionDate(b).getTime() - transactionDate(a).getTime(),
          )
        : [],
    [selectedBucket],
  )

  const behaviorInsights = useMemo<BehaviorInsight[]>(() => {
    if (expenseTransactions.length === 0) return []

    const weekdayTotals = expenseTransactions.reduce(
      (acc, transaction) => {
        const weekday = transactionDate(transaction).toLocaleDateString('en-GB', {
          weekday: 'long',
        })
        if (!acc[weekday]) acc[weekday] = { total: 0, count: 0 }
        acc[weekday].total += transaction.amount
        acc[weekday].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    const [topWeekday] = Object.entries(weekdayTotals)
      .map(([weekday, data]) => ({ weekday, ...data }))
      .sort((a, b) => b.total - a.total)

    const [topCategoryByCount] = expenseCategories
      .map((category) => ({
        category: category.category,
        count: category.transactions.length,
        total: category.total,
      }))
      .sort((a, b) => b.count - a.count || b.total - a.total)

    const growth = getCategoryGrowth(expenseTransactions)
    const dominantCategory = expenseCategories[0]

    const insights: BehaviorInsight[] = []

    if (topWeekday) {
      insights.push({
        icon: CalendarDays,
        eyebrow: 'Spending rhythm',
        title: `Most money leaves on ${topWeekday.weekday}`,
        detail: `${formatMoney(topWeekday.total)} across ${topWeekday.count} expense${
          topWeekday.count === 1 ? '' : 's'
        }.`,
        color: '#2563eb',
      })
    }

    if (topCategoryByCount) {
      insights.push({
        icon: Tag,
        eyebrow: 'Repeated habit',
        title: `${topCategoryByCount.category} appears ${topCategoryByCount.count} time${
          topCategoryByCount.count === 1 ? '' : 's'
        }`,
        detail: `${formatMoney(topCategoryByCount.total)} total in this category.`,
        color: '#059669',
      })
    }

    if (growth) {
      insights.push({
        icon: TrendingUp,
        eyebrow: 'Momentum',
        title: `${growth.category} accelerated`,
        detail: `${formatMoney(growth.delta)} more in the second half of the period.`,
        color: '#f59e0b',
      })
    } else if (dominantCategory) {
      const percentage = totalExpenses > 0 ? (dominantCategory.total / totalExpenses) * 100 : 0
      insights.push({
        icon: Sparkles,
        eyebrow: 'Main driver',
        title: `${dominantCategory.category} leads the month`,
        detail: `${percentage.toFixed(0)}% of expenses, ${formatMoney(dominantCategory.total)} total.`,
        color: '#7c3aed',
      })
    }

    return insights
  }, [expenseCategories, expenseTransactions, totalExpenses])

  const cardBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const rowHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  if (transactions.length === 0) {
    return (
      <ChartEmptyState
        title="No transactions in this range"
        description="Pick another period or log income and expenses to see activity here."
      />
    )
  }

  if (!periodType || !selectedDate) {
    return (
      <ChartEmptyState
        title="Pick a period to see activity"
        description="Switch between day, week, month or year to visualise transactions."
      />
    )
  }

  return (
    <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
      <PeriodBucketBarChart
        transactions={transactions}
        periodType={periodType}
        selectedDate={selectedDate}
        filter="ALL"
        accent="violet"
        onBucketClick={(bucket: PeriodBucket) => setSelectedBucketKey(bucket.key)}
      />

      <ChartPlotShell
        title={selectedBucket ? selectedBucket.tooltip : 'Selected transactions'}
        caption={
          selectedBucket
            ? `${selectedBucket.transactions.length} transaction${
                selectedBucket.transactions.length === 1 ? '' : 's'
              } - Income ${formatMoney(selectedBucket.income)} / Expense ${formatMoney(selectedBucket.expense)}`
            : 'Click a bar to inspect its transactions'
        }
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg="purple.50"
        badgeColor="purple.600"
      >
        {selectedBucketTransactions.length > 0 ? (
          <VStack spacing={2.5} align="stretch">
            {selectedBucketTransactions.map((transaction, index) => (
                <HStack
                  key={transaction.id ?? `${transaction.description}-${index}`}
                  spacing={3}
                  p={3}
                  borderRadius="xl"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ bg: rowHoverBg }}
                  transition="background 0.18s ease"
                >
                  <Box
                    w="34px"
                    h="34px"
                    borderRadius="lg"
                    display="grid"
                    placeItems="center"
                    bg={transaction.type === 'INCOME' ? 'green.50' : 'red.50'}
                    color={transaction.type === 'INCOME' ? 'green.600' : 'red.600'}
                    fontSize="sm"
                    fontWeight={800}
                    flexShrink={0}
                  >
                    {index + 1}
                  </Box>

                  <VStack spacing={0.5} align="stretch" flex="1" minW={0}>
                    <HStack spacing={2} minW={0}>
                      <Text
                        fontSize="sm"
                        fontWeight={700}
                        color={textColor}
                        noOfLines={1}
                      >
                        {transaction.description || transaction.category}
                      </Text>
                      <Badge
                        flexShrink={0}
                        colorScheme={transaction.type === 'INCOME' ? 'green' : 'red'}
                        variant="subtle"
                        borderRadius="full"
                        textTransform="none"
                        letterSpacing="0"
                      >
                        {transaction.category || 'Uncategorized'}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                      {formatShortDate(transaction)}
                      {transaction.paymentMethodName
                        ? ` - ${transaction.paymentMethodName}`
                        : ''}
                    </Text>
                  </VStack>

                  <Text
                    color={transaction.type === 'INCOME' ? 'green.500' : 'red.500'}
                    fontSize="sm"
                    fontWeight={800}
                    whiteSpace="nowrap"
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatMoney(transaction.amount)}
                  </Text>
                </HStack>
            ))}
          </VStack>
        ) : (
          <Box borderRadius="xl" border="1px dashed" borderColor={borderColor} p={5} textAlign="center">
            <Text fontSize="sm" fontWeight={700} color={textColor}>
              {selectedBucket
                ? `No transactions in ${selectedBucket.tooltip}`
                : 'Click a bar to see its transactions'}
            </Text>
            <Text mt={1} fontSize="xs" color={mutedColor}>
              {selectedBucket
                ? 'Choose another bar to inspect the activity for that day.'
                : 'Hover still shows totals; click opens the exact entries behind that bar.'}
            </Text>
          </Box>
        )}
      </ChartPlotShell>

      {expenseTransactions.length > 0 && (
          <Box>
            <HStack spacing={2} mb={3}>
              <Icon as={Sparkles} boxSize={4} color="purple.500" />
              <Text
                fontSize="xs"
                fontWeight={800}
                color={mutedColor}
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Behavioral Patterns
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              {behaviorInsights.map((insight) => (
                <Box
                  key={`${insight.eyebrow}-${insight.title}`}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  p={4}
                  minH="138px"
                  boxShadow="0 1px 2px rgba(15,23,42,0.04)"
                >
                  <VStack spacing={3} align="stretch" h="100%">
                    <HStack justify="space-between" align="center">
                      <Box
                        w="34px"
                        h="34px"
                        borderRadius="lg"
                        display="grid"
                        placeItems="center"
                        bg={`${insight.color}18`}
                      >
                        <Icon as={insight.icon} boxSize={4} color={insight.color} />
                      </Box>
                      <Icon as={ReceiptText} boxSize={4} color={mutedColor} opacity={0.65} />
                    </HStack>

                    <VStack spacing={1} align="stretch">
                      <Text
                        fontSize="2xs"
                        fontWeight={800}
                        color={mutedColor}
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                      >
                        {insight.eyebrow}
                      </Text>
                      <Text fontSize="sm" fontWeight={800} color={textColor} lineHeight="1.25">
                        {insight.title}
                      </Text>
                      <Text fontSize="xs" color={mutedColor} lineHeight="1.45">
                        {insight.detail}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
      )}
    </VStack>
  )
}
