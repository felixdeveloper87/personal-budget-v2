import { useMemo } from 'react'
import { Box, HStack, Text, VStack, useColorMode } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { cumulativeDailyExpense, daysInMonth } from '../insights'
import Panel from './Panel'
import { fmtCurrency } from './format'

interface SpendingPaceProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
}

/**
 * Cumulative spend this month plotted against last month on the same
 * day-of-month scale, so "am I ahead of or behind last month?" is one glance.
 */
export default function SpendingPace({ transactions, selectedDate, dateBasis }: SpendingPaceProps) {
  const reduce = useReducedMotion()
  const { colorMode } = useColorMode()
  const dark = colorMode === 'dark'

  // recharts writes stroke/fill as SVG attributes, where CSS var() is
  // unreliable — so resolve concrete colours per color mode here.
  const c = {
    current: dark ? '#f6928a' : '#c23a2c',
    previous: dark ? '#7f8d9d' : '#8392a3',
    grid: dark ? 'rgba(226,235,247,0.10)' : 'rgba(28,58,92,0.14)',
    tick: dark ? '#7f8d9d' : '#8392a3',
    tooltipBg: dark ? '#12181f' : '#f6f8fb',
    tooltipBorder: dark ? 'rgba(226,235,247,0.18)' : 'rgba(28,58,92,0.14)',
    tooltipText: dark ? '#e8eef6' : '#15202e',
  }

  const { data, spentSoFar, paceDelta, projected, prevTotal, elapsedDays } = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const prev = new Date(year, month - 1, 1)

    const current = cumulativeDailyExpense(transactions, year, month, dateBasis)
    const previous = cumulativeDailyExpense(
      transactions,
      prev.getFullYear(),
      prev.getMonth(),
      dateBasis,
    )

    // Draw the current line only up to today when we're inside the month.
    const now = new Date()
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
    const shownDays = isCurrentMonth ? Math.min(now.getDate(), current.length) : current.length

    const totalDays = Math.max(current.length, previous.length)
    const points = Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      current: i < shownDays ? current[i] : null,
      previous: i < previous.length ? previous[i] : null,
    }))

    const spent = current[shownDays - 1] ?? 0
    const prevAtSameDay = previous[Math.min(shownDays, previous.length) - 1] ?? 0
    const monthTotal = daysInMonth(year, month)

    return {
      data: points,
      spentSoFar: spent,
      paceDelta: spent - prevAtSameDay,
      projected: isCurrentMonth && shownDays >= 3 ? (spent / shownDays) * monthTotal : null,
      prevTotal: previous[previous.length - 1] ?? 0,
      elapsedDays: shownDays,
    }
  }, [transactions, selectedDate, dateBasis])

  const ahead = paceDelta > 0
  const DeltaIcon = ahead ? ArrowUpRight : ArrowDownRight

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        {/* Header */}
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={2}>
          <VStack align="stretch" spacing={1}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Spending pace
            </Text>
            <HStack align="baseline" spacing={3} flexWrap="wrap">
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="xl"
                fontWeight={500}
                color="var(--pb-ink)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmtCurrency(spentSoFar)}
              </Text>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.08em">
                BY DAY {elapsedDays}
              </Text>
            </HStack>
          </VStack>

          <HStack
            spacing={1}
            px={2}
            py="2px"
            borderRadius="999px"
            bg={ahead ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
            color={ahead ? 'var(--pb-coral)' : 'var(--pb-income-2)'}
            flexShrink={0}
          >
            <DeltaIcon size={12} />
            <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtCurrency(Math.abs(paceDelta))} vs last month
            </Text>
          </HStack>
        </HStack>

        {/* Chart */}
        <Box h="180px" w="full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="pb-pace-current" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.current} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={c.current} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.grid} strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: c.tick, fontFamily: 'var(--pb-mono)' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
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
                labelFormatter={(day) => `Day ${day}`}
                formatter={(value: number | string, name: string) => [
                  fmtCurrency(Number(value), { minimumFractionDigits: 2 }),
                  name === 'current' ? 'This month' : 'Last month',
                ]}
              />
              <Area
                type="monotone"
                dataKey="previous"
                stroke={c.previous}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
                isAnimationActive={!reduce}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke={c.current}
                strokeWidth={2}
                fill="url(#pb-pace-current)"
                connectNulls={false}
                isAnimationActive={!reduce}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Caption */}
        <Text fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-soft)" lineHeight={1.5}>
          {projected !== null
            ? `At this pace you'll spend about ${fmtCurrency(projected)} this month — last month closed at ${fmtCurrency(prevTotal)}.`
            : `Last month closed at ${fmtCurrency(prevTotal)}. The dashed line is last month's running total.`}
        </Text>
      </VStack>
    </Panel>
  )
}
