import { useId, useMemo } from 'react'
import {
  Box,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

import type { PeriodType, Transaction } from '../../../../types'
import {
  bucketTransactionsByPeriod,
  getPeriodHeadline,
  type PeriodFilter,
} from '../utils/periodBuckets'

export type PeriodBucketAccent = 'blue' | 'green' | 'red' | 'violet'

interface AccentPalette {
  from: string
  to: string
  trackLight: string
  trackDark: string
}

const ACCENTS: Record<PeriodBucketAccent, AccentPalette> = {
  blue: {
    from: '#60a5fa',
    to: '#3b82f6',
    trackLight: 'rgba(59, 130, 246, 0.10)',
    trackDark: 'rgba(96, 165, 250, 0.14)',
  },
  green: {
    from: '#34d399',
    to: '#10b981',
    trackLight: 'rgba(16, 185, 129, 0.10)',
    trackDark: 'rgba(52, 211, 153, 0.14)',
  },
  red: {
    from: '#f87171',
    to: '#ef4444',
    trackLight: 'rgba(239, 68, 68, 0.10)',
    trackDark: 'rgba(248, 113, 113, 0.14)',
  },
  violet: {
    from: '#a78bfa',
    to: '#7c3aed',
    trackLight: 'rgba(124, 58, 237, 0.10)',
    trackDark: 'rgba(167, 139, 250, 0.14)',
  },
}

export interface PeriodBucketBarChartProps {
  transactions: Transaction[]
  selectedDate: Date
  periodType: PeriodType
  /** Filter transactions by type. Defaults to "ALL". */
  filter?: PeriodFilter
  /**
   * Title rendered top-left in uppercase. When omitted, derived from
   * `periodType` + `selectedDate` (e.g. "TODAY", "THIS WEEK", "APRIL 2026").
   */
  title?: string
  /** Currency symbol prefix shown next to the total. Default "£". */
  currency?: string
  /** Bar plot height in pixels. Default 140. */
  height?: number
  accent?: PeriodBucketAccent
}

/**
 * Compact bar chart that summarises the active period at a glance:
 *  - Uppercase label top-left (e.g. "THIS WEEK")
 *  - Bold total top-right
 *  - One bar per sub-bucket (hour block / day / day-of-month / month)
 *
 * Designed to be used inside `<TransactionsChart />`, `<IncomeChart />` and
 * `<ExpensesChart />` as the headline visualization above the more detailed
 * pie / line / stacked-bar charts.
 */
export default function PeriodBucketBarChart({
  transactions,
  selectedDate,
  periodType,
  filter = 'ALL',
  title,
  currency = '£',
  height = 140,
  accent = 'violet',
}: PeriodBucketBarChartProps) {
  const buckets = useMemo(
    () =>
      bucketTransactionsByPeriod(transactions, periodType, selectedDate, filter),
    [transactions, periodType, selectedDate, filter],
  )

  const total = useMemo(
    () => buckets.reduce((sum, b) => sum + b.value, 0),
    [buckets],
  )

  const isStackedByType = filter === 'ALL'

  // `useId` keeps the SVG `<linearGradient>` id unique across multiple
  // charts on the page (e.g. one per period section). Without this, two
  // charts with the same accent would share a gradient by id collision.
  const reactId = useId()
  const gradientId = `pbbc-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`

  const palette = ACCENTS[accent]

  const surfaceBg = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0f0f0f 0%, #141414 100%)',
  )
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.500', 'gray.500')
  const valueColor = useColorModeValue('gray.900', 'gray.50')
  const tickColor = useColorModeValue('#94a3b8', '#64748b')
  const trackFill = useColorModeValue(palette.trackLight, palette.trackDark)
  const stackedTrackFill = useColorModeValue('rgba(148, 163, 184, 0.14)', 'rgba(148, 163, 184, 0.16)')
  const incomeFill = useColorModeValue('#10b981', '#22c55e')
  const expenseFill = useColorModeValue('#ef4444', '#f87171')
  const tooltipBg = useColorModeValue('#ffffff', '#0a0a0a')
  const tooltipBorder = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)')
  const tooltipText = useColorModeValue('#0f172a', '#f8fafc')

  const headline = title ?? getPeriodHeadline(periodType, selectedDate)

  return (
    <Box
      borderRadius="2xl"
      bg={surfaceBg}
      border="1px solid"
      borderColor={borderColor}
      p={{ base: 4, sm: 5 }}
      boxShadow="sm"
    >
      <HStack justify="space-between" align="baseline" mb={{ base: 2, sm: 3 }}>
        <Text
          fontSize="xs"
          fontWeight={700}
          color={titleColor}
          textTransform="uppercase"
          letterSpacing="0.08em"
          noOfLines={1}
        >
          {headline}
        </Text>
        <Text
          fontSize={{ base: 'lg', sm: 'xl' }}
          fontWeight={800}
          color={valueColor}
          letterSpacing="-0.01em"
        >
          {currency}
          {total.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </HStack>

      <Box mt={1}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={buckets}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.from} stopOpacity={1} />
                <stop offset="100%" stopColor={palette.to} stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={20}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '12px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              labelStyle={{ color: tooltipText, fontSize: '11px', fontWeight: 600 }}
              itemStyle={{ color: tooltipText, padding: 0 }}
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { tooltip?: string } | undefined)
                  ?.tooltip ?? ''
              }
              formatter={(value: number | string, name: string) => [
                `${currency}${Number(value).toLocaleString('en-GB', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                isStackedByType ? name : '',
              ]}
              separator=""
            />
            {isStackedByType ? (
              <>
                <Bar
                  dataKey="expense"
                  name="Expense"
                  stackId="type"
                  fill={expenseFill}
                  radius={[0, 0, 4, 4]}
                  maxBarSize={32}
                  background={{ fill: stackedTrackFill, radius: 6 }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  stackId="type"
                  fill={incomeFill}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </>
            ) : (
              <Bar
                dataKey="value"
                fill={`url(#${gradientId})`}
                radius={[6, 6, 4, 4]}
                maxBarSize={32}
                background={{ fill: trackFill, radius: 6 }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
