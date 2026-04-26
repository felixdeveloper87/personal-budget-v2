import { Fragment, useMemo } from 'react'
import { Box, HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react'
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
  /**
   * When `true`, render labels even on small screens. Default `false` —
   * labels collapse to icon + value below the `md` breakpoint to keep the
   * row tight.
   */
  alwaysShowLabels?: boolean
}

interface StatTile {
  icon: LucideIcon
  value: string | number
  label: string
  color: string
}

/**
 * Compact, inline KPI row designed to live alongside a section header
 * (icon + title + caption ⋯ stats ⋯ period badge). Intentionally
 * minimal — no card chrome, no gradient text, no animations — so it
 * reads as a discrete annotation rather than a focal element.
 */
export default function ChartHeaderStats({
  transactions,
  variant,
  currency = '£',
  currentBalance = 0,
  alwaysShowLabels = false,
}: ChartHeaderStatsProps) {
  const chartColors = useChartColors(
    variant === 'balance' ? currentBalance : undefined,
  )

  const valueColor = useColorModeValue('gray.900', 'gray.50')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')

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
          label: 'Balance',
          color: chartColors.balanceColor,
        },
        {
          icon: Percent,
          value: `${savingsRate}%`,
          label: 'Savings',
          color: chartColors.savingsColor,
        },
        {
          icon: TrendingUp,
          value: `${currency}${totalIncome.toFixed(2)}`,
          label: 'Income',
          color: chartColors.averageColor,
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
          color: chartColors.incomeColor,
        },
        {
          icon: TrendingDown,
          value: expenseCount,
          label: 'Expenses',
          color: chartColors.expenseColor,
        },
        {
          icon: Activity,
          value: total,
          label: 'Total',
          color: chartColors.transactionsColor,
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
          label: 'Total',
          color: chartColors.incomeColor,
        },
        {
          icon: BarChart3,
          value: count,
          label: 'Entries',
          color: chartColors.transactionsColor,
        },
        {
          icon: TrendingUp,
          value: `${currency}${average.toFixed(2)}`,
          label: 'Average',
          color: chartColors.averageColor,
        },
      ]
    }

    return [
      {
        icon: DollarSign,
        value: `${currency}${total.toFixed(2)}`,
        label: 'Total',
        color: chartColors.expenseColor,
      },
      {
        icon: BarChart3,
        value: count,
        label: 'Entries',
        color: chartColors.transactionsColor,
      },
      {
        icon: TrendingDown,
        value: `${currency}${average.toFixed(2)}`,
        label: 'Average',
        color: chartColors.averageColor,
      },
    ]
  }, [transactions, variant, currency, currentBalance, chartColors])

  const labelDisplay = alwaysShowLabels
    ? { base: 'inline', md: 'inline' }
    : { base: 'none', sm: 'inline' }

  return (
    <HStack
      spacing={{ base: 2.5, md: 3.5 }}
      align="center"
      flexWrap="wrap"
      rowGap={2}
    >
      {tiles.map((tile, idx) => (
        <Fragment key={tile.label}>
          {idx > 0 && (
            <Box
              w="1px"
              h="14px"
              bg={dividerColor}
              flexShrink={0}
              aria-hidden
            />
          )}
          <HStack spacing={1.5} align="center" flexShrink={0}>
            <Icon
              as={tile.icon}
              boxSize={3.5}
              color={tile.color}
              strokeWidth={2.25}
            />
            <Text
              fontSize="sm"
              fontWeight={700}
              color={valueColor}
              lineHeight="1"
              whiteSpace="nowrap"
            >
              {tile.value}
            </Text>
            <Text
              as="span"
              fontSize="xs"
              color={labelColor}
              fontWeight={500}
              lineHeight="1"
              display={labelDisplay}
              whiteSpace="nowrap"
            >
              {tile.label}
            </Text>
          </HStack>
        </Fragment>
      ))}
    </HStack>
  )
}
