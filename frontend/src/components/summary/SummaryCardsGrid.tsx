import { SimpleGrid, Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { SUMMARY_CARD_COLORS } from '../../constants/summaryColors'
import { getResponsiveStyles } from '../ui'
import SummaryCard from './SummaryCard'

// ✅ Tipagem explícita dos tipos válidos de card
type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryCardsGridProps {
  transactions: any[]
  income: number
  expense: number
  balance: number
  onCardClick: (cardId: string) => void
}

export default function SummaryCardsGrid({ 
  transactions, 
  income, 
  expense, 
  balance, 
  onCardClick 
}: SummaryCardsGridProps) {
  const responsiveStyles = getResponsiveStyles()
  
  // ✅ Define stats usando cores centralizadas
  const stats: {
    id: CardId
    label: string
    icon: any
    color: string
    bgColor: string
    darkBgColor: string
    helpText: string
    displayValue: string
  }[] = useMemo(() => [
    {
      id: 'transactions',
      label: 'Transactions',
      icon: BarChart3,
      color: SUMMARY_CARD_COLORS.transactions.color,
      bgColor: SUMMARY_CARD_COLORS.transactions.bg,
      darkBgColor: SUMMARY_CARD_COLORS.transactions.bgDark,
      helpText: 'Total transactions',
      displayValue: transactions.length.toString(),
    },
    {
      id: 'income',
      label: 'Income',
      icon: TrendingUp,
      color: SUMMARY_CARD_COLORS.income.color,
      bgColor: SUMMARY_CARD_COLORS.income.bg,
      darkBgColor: SUMMARY_CARD_COLORS.income.bgDark,
      helpText: 'Total income',
      displayValue: `£${income.toFixed(2)}`,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      color: SUMMARY_CARD_COLORS.expenses.color,
      bgColor: SUMMARY_CARD_COLORS.expenses.bg,
      darkBgColor: SUMMARY_CARD_COLORS.expenses.bgDark,
      helpText: 'Total expenses',
      displayValue: `£${expense.toFixed(2)}`,
    },
    {
      id: 'balance',
      label: 'Balance',
      icon: DollarSign,
      color: SUMMARY_CARD_COLORS.balance.color,
      bgColor: SUMMARY_CARD_COLORS.balance.bg,
      darkBgColor: SUMMARY_CARD_COLORS.balance.bgDark,
      helpText: 'Current balance',
      displayValue: `£${balance.toFixed(2)}`,
    },
  ], [transactions.length, income, expense, balance])

  return (
    <Box p={responsiveStyles.summaryCards.container.padding}>
      <SimpleGrid
        columns={responsiveStyles.summaryCards.grid.columns}
        spacing={responsiveStyles.summaryCards.grid.spacing}
        w="full"
        mb={2}
      >
        {stats.map((stat, index) => (
          <SummaryCard
            key={stat.id}
            stat={stat}
            index={index}
            onCardClick={onCardClick}
          />
        ))}
      </SimpleGrid>
    </Box>
  )
}
