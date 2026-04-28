import { SimpleGrid } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { LucideIcon } from '../ui/icons'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  CalendarRange,
  Calendar,
  CalendarClock,
} from '../ui/icons'
import { SUMMARY_CARD_COLORS } from '../../constants/summaryColors'
import SummaryCard from './SummaryCard'
import { PeriodType } from '../../types'

type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryCardsGridProps {
  transactions: any[]
  income: number
  expense: number
  balance: number
  selectedPeriod: PeriodType
  onCardClick: (cardId: string) => void
}

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default function SummaryCardsGrid({
  transactions,
  income,
  expense,
  balance,
  selectedPeriod,
  onCardClick,
}: SummaryCardsGridProps) {
  const periodMeta = useMemo(() => {
    const meta: Record<
      PeriodType,
      {
        label: string
        detail: string
        accentColor: string
        icon: LucideIcon
      }
    > = {
      day: {
        label: 'Daily Summary',
        detail: "Updates with today's numbers",
        accentColor: 'blue.400',
        icon: CalendarDays,
      },
      week: {
        label: 'Weekly Summary',
        detail: 'Captures the latest 7 days',
        accentColor: 'purple.400',
        icon: CalendarRange,
      },
      month: {
        label: 'Monthly Summary',
        detail: "Reflects this month's activity",
        accentColor: 'green.400',
        icon: Calendar,
      },
      year: {
        label: 'Yearly Summary',
        detail: 'Aggregated for the year',
        accentColor: 'orange.400',
        icon: CalendarClock,
      },
    }

    return meta[selectedPeriod]
  }, [selectedPeriod])

  const stats: {
    id: CardId
    label: string
    icon: LucideIcon
    color: string
    bgColor: string
    darkBgColor: string
    helpText: string
    displayValue: string
    description?: string
  }[] = useMemo(
    () => [
      {
        id: 'transactions',
        label: 'Transactions',
        icon: BarChart3,
        color: SUMMARY_CARD_COLORS.transactions.color,
        bgColor: SUMMARY_CARD_COLORS.transactions.bg,
        darkBgColor: SUMMARY_CARD_COLORS.transactions.bgDark,
        helpText:
          transactions.length === 1
            ? '1 record captured'
            : `${transactions.length} records captured`,
        description: 'Movements for the selected period',
        displayValue: transactions.length.toString(),
      },
      {
        id: 'income',
        label: 'Income',
        icon: TrendingUp,
        color: SUMMARY_CARD_COLORS.income.color,
        bgColor: SUMMARY_CARD_COLORS.income.bg,
        darkBgColor: SUMMARY_CARD_COLORS.income.bgDark,
        helpText: 'Confirmed inflows',
        description: 'Everything in for the selected period',
        displayValue: currencyFormatter.format(income),
      },
      {
        id: 'expenses',
        label: 'Expenses',
        icon: TrendingDown,
        color: SUMMARY_CARD_COLORS.expenses.color,
        bgColor: SUMMARY_CARD_COLORS.expenses.bg,
        darkBgColor: SUMMARY_CARD_COLORS.expenses.bgDark,
        helpText: 'Paid outflows',
        description: 'Everything out for the selected period',
        displayValue: currencyFormatter.format(expense),
      },
      {
        id: 'balance',
        label: 'Balance',
        icon: DollarSign,
        color: SUMMARY_CARD_COLORS.balance.color,
        bgColor: SUMMARY_CARD_COLORS.balance.bg,
        darkBgColor: SUMMARY_CARD_COLORS.balance.bgDark,
        helpText: 'Available now',
        description: 'Balance for the selected period',
        displayValue: currencyFormatter.format(balance),
      },
    ],
    [transactions.length, income, expense, balance],
  )

  return (
    <SimpleGrid
      columns={{ base: 2, sm: 2, lg: 4 }}
      spacing={{ base: 3, md: 4 }}
      w="full"
    >
      {stats.map((stat) => (
        <SummaryCard
          key={stat.id}
          stat={stat}
          onCardClick={onCardClick}
          periodMeta={periodMeta}
        />
      ))}
    </SimpleGrid>
  )
}
