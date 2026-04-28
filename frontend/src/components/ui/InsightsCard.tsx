import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Lightbulb,
} from './icons'
import type { LucideIcon } from './icons'
import { useTransactionInsights } from '../../hooks/useTransactionInsights'
import { Transaction } from '../../types'

interface InsightsCardProps {
  transactions: Transaction[]
  selectedPeriod: string
  cardType: 'transactions' | 'income' | 'expenses' | 'balance'
}

const CARD_ICONS: Record<InsightsCardProps['cardType'], LucideIcon> = {
  income: TrendingUp,
  expenses: TrendingDown,
  balance: DollarSign,
  transactions: BarChart3,
}

export default function InsightsCard({
  transactions,
  selectedPeriod,
  cardType,
}: InsightsCardProps) {
  const insights = useTransactionInsights(transactions, selectedPeriod)

  const cardBg = useColorModeValue('gray.50', 'blackAlpha.500')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const iconColor = useColorModeValue('blue.500', 'blue.300')
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.400')

  const InsightIcon = CARD_ICONS[cardType]

  const getCardSpecificInsights = () => {
    const specificInsights: string[] = []

    switch (cardType) {
      case 'transactions':
        if (insights.totalTransactions > 0) {
          specificInsights.push(`Total of ${insights.totalTransactions} transactions`)
          if (insights.mostActiveDay) {
            specificInsights.push(`${insights.mostActiveDay} is your most active day`)
          }
          if (insights.mostUsedCategory) {
            specificInsights.push(`Favorite category: ${insights.mostUsedCategory}`)
          }
        }
        break

      case 'income':
        if (insights.totalIncome > 0) {
          specificInsights.push(`Total income: £${insights.totalIncome.toFixed(2)}`)
          if (insights.highestTransaction && insights.highestTransaction.type === 'INCOME') {
            const date = new Date(insights.highestTransaction.dateTime).toLocaleDateString('en-US')
            specificInsights.push(`Highest income: £${insights.highestTransaction.amount.toFixed(2)} on ${date}`)
          }
          if (insights.averageIncomePerDay > 0 && selectedPeriod !== 'day') {
            const periodLabel =
              selectedPeriod === 'week'
                ? 'per day'
                : selectedPeriod === 'month'
                  ? 'per day'
                  : selectedPeriod === 'year'
                    ? 'per day'
                    : 'average'
            specificInsights.push(`Average income ${periodLabel}: £${insights.averageIncomePerDay.toFixed(2)}`)
          }
        }
        break

      case 'expenses':
        if (insights.totalExpense > 0) {
          specificInsights.push(`Total expenses: £${insights.totalExpense.toFixed(2)}`)
          if (insights.highestTransaction && insights.highestTransaction.type === 'EXPENSE') {
            const date = new Date(insights.highestTransaction.dateTime).toLocaleDateString('en-US')
            specificInsights.push(`Highest expense: £${insights.highestTransaction.amount.toFixed(2)} on ${date}`)
          }
          if (insights.averageExpensePerDay > 0 && selectedPeriod !== 'day') {
            const periodLabel =
              selectedPeriod === 'week'
                ? 'per day'
                : selectedPeriod === 'month'
                  ? 'per day'
                  : selectedPeriod === 'year'
                    ? 'per day'
                    : 'average'
            specificInsights.push(`Average expense ${periodLabel}: £${insights.averageExpensePerDay.toFixed(2)}`)
          }
        }
        break

      case 'balance':
        if (insights.netBalance !== 0) {
          if (insights.netBalance > 0) {
            specificInsights.push(`Positive balance: £${insights.netBalance.toFixed(2)}`)
          } else {
            specificInsights.push(`Negative balance: £${Math.abs(insights.netBalance).toFixed(2)}`)
          }
          specificInsights.push(`Income: £${insights.totalIncome.toFixed(2)}`)
          specificInsights.push(`Expenses: £${insights.totalExpense.toFixed(2)}`)
        }

        if (insights.savingsRate !== 0) {
          specificInsights.push(`Savings Rate: ${insights.savingsRate.toFixed(1)}%`)
        }
        specificInsights.push(
          `Balance Trend: ${insights.balanceTrend === 'positive' ? 'Growing wealth' : 'Spending more than earning'}`,
        )
        specificInsights.push(
          `Financial Stability: ${insights.financialStability === 'stable' ? 'Consistent growth' : 'High volatility'}`,
        )
        break
    }

    return specificInsights
  }

  const cardSpecificInsights = getCardSpecificInsights()
  const hasInsights = cardSpecificInsights.length > 0

  if (!hasInsights) return null

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={4}
      backdropFilter="blur(10px)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        borderColor: hoverBorderColor,
      }}
      transition="all 0.2s ease"
    >
      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <Icon as={Lightbulb} boxSize={4} color={iconColor} />
          <Text
            fontSize="sm"
            fontWeight="600"
            color={textColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Period Insights
          </Text>
        </HStack>

        <VStack spacing={2} align="stretch">
          {cardSpecificInsights.map((insight, index) => (
            <HStack key={index} spacing={2} align="flex-start">
              <Icon as={InsightIcon} boxSize={3} color={iconColor} mt={0.5} flexShrink={0} />
              <Text
                fontSize="xs"
                color={textColor}
                fontFamily="system-ui, -apple-system, sans-serif"
                lineHeight="1.45"
              >
                {insight}
              </Text>
            </HStack>
          ))}
        </VStack>

        {insights.transactionTrend !== 'stable' && (
          <Badge
            colorScheme={insights.transactionTrend === 'increasing' ? 'green' : 'red'}
            variant="subtle"
            size="sm"
            alignSelf="flex-start"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {insights.transactionTrend === 'increasing' ? '📈 Growing trend' : '📉 Declining trend'}
          </Badge>
        )}
      </VStack>
    </Box>
  )
}
