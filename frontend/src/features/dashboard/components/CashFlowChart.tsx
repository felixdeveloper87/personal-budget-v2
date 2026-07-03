import { useMemo } from 'react'
import { Box, HStack, Text, VStack, useColorMode } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PeriodType, Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { bucketTransactionsByPeriod } from '../../../components/charts/modal/utils/periodBuckets'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface CashFlowChartProps {
  transactions: Transaction[]
  selectedDate: Date
  periodType: PeriodType
  dateBasis: TransactionDateBasis
  totals: {
    income: number
    expense: number
  }
}

export default function CashFlowChart({
  transactions,
  selectedDate,
  periodType,
  dateBasis,
  totals,
}: CashFlowChartProps) {
  const reduce = useReducedMotion()
  const { colorMode } = useColorMode()
  const dark = colorMode === 'dark'

  // recharts writes stroke/fill as SVG attributes, where CSS var() is
  // unreliable — so resolve concrete colours per color mode here.
  const c = {
    income: dark ? '#5fd394' : '#1f8a4f',
    expense: dark ? '#ff9a90' : '#b8452f',
    grid: dark ? 'rgba(244,246,242,0.10)' : 'rgba(26,50,38,0.14)',
    tick: dark ? '#8a8f89' : '#84907f',
    tooltipBg: dark ? '#151517' : '#faf9f2',
    tooltipBorder: dark ? 'rgba(244,246,242,0.18)' : 'rgba(26,50,38,0.16)',
    tooltipText: dark ? '#f2f4f0' : '#1a2620',
  }

  const data = useMemo(
    () =>
      bucketTransactionsByPeriod(transactions, periodType, selectedDate, 'ALL', dateBasis).map((b) => ({
        label: b.label,
        tooltip: b.tooltip,
        income: b.income,
        expense: b.expense,
      })),
    [transactions, periodType, selectedDate, dateBasis],
  )

  return (
    <Panel>
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
          <VStack align="stretch" spacing={1}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Cash flow
            </Text>
            <HStack spacing={4} align="baseline" flexWrap="wrap">
              <Legend color={c.income} label="Income" value={fmtCurrency(totals.income)} />
              <Legend color={c.expense} label="Expenses" value={fmtCurrency(totals.expense)} />
            </HStack>
          </VStack>
        </HStack>

        {/* Chart */}
        <Box h="220px" w="full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="pb-cf-income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.income} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={c.income} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="pb-cf-expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.expense} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={c.expense} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.grid} strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: c.tick, fontFamily: 'var(--pb-mono)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                tick={{ fontSize: 10, fill: c.tick, fontFamily: 'var(--pb-mono)' }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => fmtCurrency(v, { notation: 'compact' })}
              />
              <Tooltip
                cursor={{ stroke: c.tooltipBorder, strokeWidth: 1 }}
                contentStyle={{
                  background: c.tooltipBg,
                  border: `1px solid ${c.tooltipBorder}`,
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontFamily: 'var(--pb-mono)',
                  fontSize: '11px',
                }}
                labelStyle={{ color: c.tooltipText, fontSize: '11px', marginBottom: '4px' }}
                itemStyle={{ color: c.tooltipText }}
                labelFormatter={(_, payload) =>
                  (payload?.[0]?.payload as { tooltip?: string } | undefined)?.tooltip ?? ''
                }
                formatter={(value: number | string, name: string) => [
                  fmtCurrency(Number(value), { minimumFractionDigits: 2 }),
                  name === 'income' ? 'Income' : 'Expenses',
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={c.income}
                strokeWidth={2}
                fill="url(#pb-cf-income)"
                isAnimationActive={!reduce}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke={c.expense}
                strokeWidth={2}
                fill="url(#pb-cf-expense)"
                isAnimationActive={!reduce}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Panel>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <HStack spacing={2}>
      <Box w={2.5} h={2.5} borderRadius="2px" bg={color} />
      <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.08em" color="var(--pb-ink-faint)" textTransform="uppercase">
        {label}
      </Text>
      <Text
        fontFamily="var(--pb-serif)"
        fontSize="sm"
        fontWeight={500}
        color="var(--pb-ink)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </HStack>
  )
}
