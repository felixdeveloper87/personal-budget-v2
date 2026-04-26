import { useMemo } from 'react'
import { HStack } from '@chakra-ui/react'
import {
  Activity,
  BarChart3,
  DollarSign,
  Percent,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Transaction } from '../../../../types'
import { useChartColors } from '../hooks'
import ChartCard from './ChartCard'

export type ChartHeaderStatsVariant =
  | 'transactions'
  | 'income'
  | 'expenses'
  | 'balance'

export interface ChartHeaderStatsProps {
  transactions: Transaction[]
  variant: ChartHeaderStatsVariant
  /** Currency symbol for monetary values. Defaults to "£". */
  currency?: string
  /**
   * Current balance, required when variant is "balance" — it can't be
   * inferred from transactions alone (depends on opening balance).
   */
  currentBalance?: number
}

interface StatTile {
  icon: LucideIcon
  value: string | number
  label: string
  gradient: string
  color: string
  hoverBorderColor: string
  delay: number
}

/**
 * Compact, fixed-width row of 3 KPI tiles rendered in a section/modal
 * header. Encapsulates the math + visual presentation that used to live
 * inside `TransactionsChart` / `IncomeChart` / `ExpensesChart`.
 *
 * Designed to be safe to drop inside a `SectionHeader` row or right
 * underneath it — the tiles scale down on small screens.
 */
export default function ChartHeaderStats({
  transactions,
  variant,
  currency = '£',
  currentBalance = 0,
}: ChartHeaderStatsProps) {
  const chartColors = useChartColors(
    variant === 'balance' ? currentBalance : undefined,
  )

  const tiles = useMemo<StatTile[]>(() => {
    if (variant === 'balance') {
      const totalIncome = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0)
      const totalExpenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0)
      const savingsRate =
        totalIncome > 0
          ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
          : '0.0'

      return [
        {
          icon: Wallet,
          value: `${currency}${currentBalance.toFixed(2)}`,
          label: 'Current balance',
          gradient: chartColors.balanceGradient,
          color: chartColors.balanceColor,
          hoverBorderColor: chartColors.balanceHoverBorder,
          delay: 0,
        },
        {
          icon: Percent,
          value: `${savingsRate}%`,
          label: 'Savings rate',
          gradient: chartColors.savingsGradient,
          color: chartColors.savingsColor,
          hoverBorderColor: chartColors.savingsHoverBorder,
          delay: 0.05,
        },
        {
          icon: TrendingUp,
          value: `${currency}${totalIncome.toFixed(2)}`,
          label: 'Total income',
          gradient: chartColors.averageGradient,
          color: chartColors.averageColor,
          hoverBorderColor: chartColors.averageHoverBorder,
          delay: 0.1,
        },
      ]
    }

    if (variant === 'transactions') {
      const incomeCount = transactions.filter((t) => t.type === 'INCOME').length
      const expenseCount = transactions.filter(
        (t) => t.type === 'EXPENSE',
      ).length
      const total = transactions.length
      return [
        {
          icon: TrendingUp,
          value: incomeCount,
          label: 'Income',
          gradient: chartColors.incomeGradient,
          color: chartColors.incomeColor,
          hoverBorderColor: chartColors.incomeHoverBorder,
          delay: 0,
        },
        {
          icon: TrendingDown,
          value: expenseCount,
          label: 'Expenses',
          gradient: chartColors.expenseGradient,
          color: chartColors.expenseColor,
          hoverBorderColor: chartColors.expenseHoverBorder,
          delay: 0.05,
        },
        {
          icon: Activity,
          value: total,
          label: 'Total',
          gradient: chartColors.transactionsGradient,
          color: chartColors.transactionsColor,
          hoverBorderColor: chartColors.transactionsHoverBorder,
          delay: 0.1,
        },
      ]
    }

    const filtered = transactions.filter((t) =>
      variant === 'income' ? t.type === 'INCOME' : t.type === 'EXPENSE',
    )
    const total = filtered.reduce((acc, t) => acc + Number(t.amount || 0), 0)
    const count = filtered.length
    const average = count > 0 ? total / count : 0

    if (variant === 'income') {
      return [
        {
          icon: DollarSign,
          value: `${currency}${total.toFixed(2)}`,
          label: 'Total income',
          gradient: chartColors.incomeGradient,
          color: chartColors.incomeColor,
          hoverBorderColor: chartColors.incomeHoverBorder,
          delay: 0,
        },
        {
          icon: BarChart3,
          value: count,
          label: 'Transactions',
          gradient: chartColors.transactionsGradient,
          color: chartColors.transactionsColor,
          hoverBorderColor: chartColors.transactionsHoverBorder,
          delay: 0.05,
        },
        {
          icon: TrendingUp,
          value: `${currency}${average.toFixed(2)}`,
          label: 'Average',
          gradient: chartColors.averageGradient,
          color: chartColors.averageColor,
          hoverBorderColor: chartColors.averageHoverBorder,
          delay: 0.1,
        },
      ]
    }

    return [
      {
        icon: DollarSign,
        value: `${currency}${total.toFixed(2)}`,
        label: 'Total expenses',
        gradient: chartColors.expenseGradient,
        color: chartColors.expenseColor,
        hoverBorderColor: chartColors.expenseHoverBorder,
        delay: 0,
      },
      {
        icon: BarChart3,
        value: count,
        label: 'Transactions',
        gradient: chartColors.transactionsGradient,
        color: chartColors.transactionsColor,
        hoverBorderColor: chartColors.transactionsHoverBorder,
        delay: 0.05,
      },
      {
        icon: TrendingDown,
        value: `${currency}${average.toFixed(2)}`,
        label: 'Average',
        gradient: chartColors.averageGradient,
        color: chartColors.averageColor,
        hoverBorderColor: chartColors.averageHoverBorder,
        delay: 0.1,
      },
    ]
  }, [transactions, variant, currency, currentBalance, chartColors])

  return (
    <HStack
      spacing={{ base: 2, sm: 3 }}
      align="stretch"
      w="full"
      sx={{
        '& > *': {
          flex: 1,
          minW: 0,
        },
      }}
    >
      {tiles.map((tile) => (
        <ChartCard
          key={tile.label}
          icon={tile.icon}
          value={tile.value}
          label={tile.label}
          gradient={tile.gradient}
          color={tile.color}
          hoverBorderColor={tile.hoverBorderColor}
          delay={tile.delay}
          minW="0"
        />
      ))}
    </HStack>
  )
}
