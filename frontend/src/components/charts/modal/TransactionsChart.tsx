import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { PeriodType, Transaction } from '../../../types'
import {
  getTransactionDate,
  type TransactionDateBasis,
} from '../../../utils/transactionDates'
import { CalendarDays, Sparkles, Tag, TrendingUp } from '../../ui/icons'
import type { LucideIcon } from '../../ui/icons'
import { ActivityLedger, ChartEmptyState, PeriodBucketBarChart } from './components'
import { processCategoriesWithTransactions } from './utils'
import { bucketTransactionsByPeriod, type PeriodBucket } from './utils/periodBuckets'

export interface TransactionsChartProps {
  transactions: Transaction[]
  periodType?: PeriodType
  selectedDate?: Date
  dateBasis?: TransactionDateBasis
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

function txDate(transaction: Transaction, basis: TransactionDateBasis): Date {
  return getTransactionDate(transaction, basis)
}

function getCategoryGrowth(
  expenses: Transaction[],
  basis: TransactionDateBasis,
): { category: string; delta: number } | null {
  if (expenses.length < 2) return null

  const timestamps = expenses
    .map((t) => txDate(t, basis).getTime())
    .sort((a, b) => a - b)
  const first = timestamps[0]
  const last = timestamps[timestamps.length - 1]
  if (first === last) return null

  const midpoint = first + (last - first) / 2
  const totals: Record<string, { firstHalf: number; secondHalf: number }> = {}

  for (const t of expenses) {
    const category = t.category || 'Uncategorized'
    if (!totals[category]) totals[category] = { firstHalf: 0, secondHalf: 0 }
    const half = txDate(t, basis).getTime() <= midpoint ? 'firstHalf' : 'secondHalf'
    totals[category][half] += t.amount
  }

  const [growth] = Object.entries(totals)
    .map(([category, total]) => ({ category, delta: total.secondHalf - total.firstHalf }))
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)

  return growth ?? null
}

export default function TransactionsChart({
  transactions,
  periodType,
  selectedDate,
  dateBasis = 'activity',
}: TransactionsChartProps) {
  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'EXPENSE'),
    [transactions],
  )

  const { sortedCategories: expenseCategories, total: totalExpenses } = useMemo(
    () => processCategoriesWithTransactions(expenseTransactions),
    [expenseTransactions],
  )

  const periodBuckets = useMemo(
    () =>
      periodType && selectedDate
        ? bucketTransactionsByPeriod(transactions, periodType, selectedDate, 'ALL', dateBasis)
        : [],
    [transactions, periodType, selectedDate, dateBasis],
  )

  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null)

  useEffect(() => {
    if (periodBuckets.find((b) => b.key === selectedBucketKey)) return
    const [largest] = [...periodBuckets]
      .filter((b) => b.transactions.length > 0)
      .sort((a, b) => b.value - a.value)
    setSelectedBucketKey(largest?.key ?? null)
  }, [periodBuckets, selectedBucketKey])

  const selectedBucket = useMemo(
    () => periodBuckets.find((b) => b.key === selectedBucketKey) ?? null,
    [periodBuckets, selectedBucketKey],
  )

  const selectedBucketTransactions = useMemo(
    () =>
      selectedBucket
        ? [...selectedBucket.transactions].sort(
            (a, b) => txDate(b, dateBasis).getTime() - txDate(a, dateBasis).getTime(),
          )
        : [],
    [selectedBucket, dateBasis],
  )

  const behaviorInsights = useMemo<BehaviorInsight[]>(() => {
    if (expenseTransactions.length === 0) return []

    const weekdayTotals = expenseTransactions.reduce(
      (acc, t) => {
        const weekday = txDate(t, dateBasis).toLocaleDateString('en-GB', { weekday: 'long' })
        if (!acc[weekday]) acc[weekday] = { total: 0, count: 0 }
        acc[weekday].total += t.amount
        acc[weekday].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number }>,
    )

    const [topWeekday] = Object.entries(weekdayTotals)
      .map(([weekday, data]) => ({ weekday, ...data }))
      .sort((a, b) => b.total - a.total)

    const [topCategoryByCount] = expenseCategories
      .map((c) => ({ category: c.category, count: c.transactions.length, total: c.total }))
      .sort((a, b) => b.count - a.count || b.total - a.total)

    const growth = getCategoryGrowth(expenseTransactions, dateBasis)
    const dominantCategory = expenseCategories[0]
    const insights: BehaviorInsight[] = []

    if (topWeekday) {
      insights.push({
        icon: CalendarDays,
        eyebrow: 'Spending rhythm',
        title: `Most money leaves on ${topWeekday.weekday}`,
        detail: `${formatMoney(topWeekday.total)} across ${topWeekday.count} expense${topWeekday.count === 1 ? '' : 's'}.`,
        color: '#2563eb',
      })
    }

    if (topCategoryByCount) {
      insights.push({
        icon: Tag,
        eyebrow: 'Repeated habit',
        title: `${topCategoryByCount.category} appears ${topCategoryByCount.count} time${topCategoryByCount.count === 1 ? '' : 's'}`,
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
  }, [expenseCategories, expenseTransactions, totalExpenses, dateBasis])

  const cardBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const insightHoverShadow = useColorModeValue(
    '0 6px 20px -8px rgba(15,23,42,0.14)',
    '0 6px 20px -8px rgba(0,0,0,0.6)',
  )

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
        dateBasis={dateBasis}
        onBucketClick={(bucket: PeriodBucket) => setSelectedBucketKey(bucket.key)}
      />

      <ActivityLedger
        key={`${selectedBucket?.key ?? 'none'}-${dateBasis}`}
        transactions={selectedBucketTransactions}
        title={selectedBucket?.tooltip ?? 'Selected period'}
        income={selectedBucket?.income ?? 0}
        expense={selectedBucket?.expense ?? 0}
        hasSelection={Boolean(selectedBucket)}
        dateBasis={dateBasis}
      />

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
                transition="transform 0.18s ease, box-shadow 0.18s ease"
                _hover={{ transform: 'translateY(-2px)', boxShadow: insightHoverShadow }}
              >
                <VStack spacing={3} align="stretch" h="100%">
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
