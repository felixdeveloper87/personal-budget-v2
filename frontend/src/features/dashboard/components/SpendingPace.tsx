import { useId, useMemo } from 'react'
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react'
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { cumulativeDailyAmount, daysInMonth } from '../insights'
import Panel from './Panel'
import { useI18n } from '../../../i18n'
import { useNuPalette } from './nu'

type PaceKind = 'expense' | 'income'

interface CashPaceProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
  kind?: PaceKind
  title?: string
  includeCommitments?: boolean
  onDismiss?: () => void
}

interface PacePoint {
  day: number
  current: number | null
  previous: number | null
  projection: number | null
}

/**
 * Cumulative amount this month against last month on the same day-of-month
 * scale, plus a dashed projection to month end — "am I ahead or behind?" in
 * one glance. Nubank treatment: one purple line with a soft fill, a quiet grey
 * comparison line, no y-axis or grid (the hero number and tooltip carry values).
 */
export default function CashPace({
  transactions,
  selectedDate,
  dateBasis,
  kind = 'expense',
  title: titleOverride,
  includeCommitments = false,
  onDismiss,
}: CashPaceProps) {
  const { t, formatCurrency } = useI18n()
  const reduce = useReducedMotion()
  const reactId = useId()
  const gradientId = `pb-${kind}-pace-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
  const nu = useNuPalette()
  const isIncome = kind === 'income'

  const { data, amountSoFar, paceDelta, projected, prevTotal, elapsedDays, totalDays } = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const prev = new Date(year, month - 1, 1)
    const pacedTransactions = isIncome || includeCommitments
      ? transactions
      : transactions.filter(
        (t) =>
          !t.isInstallment &&
          t.installmentPlanId == null &&
          !t.isRecurring &&
          t.recurringTransactionId == null,
      )

    const transactionType = isIncome ? 'INCOME' : 'EXPENSE'
    const current = cumulativeDailyAmount(pacedTransactions, year, month, dateBasis, transactionType)
    const previous = cumulativeDailyAmount(
      pacedTransactions,
      prev.getFullYear(),
      prev.getMonth(),
      dateBasis,
      transactionType,
    )

    const now = new Date()
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month
    const shownDays = isCurrentMonth ? Math.min(now.getDate(), current.length) : current.length
    const monthTotal = daysInMonth(year, month)
    const spent = current[shownDays - 1] ?? 0
    const projectedTotal = isCurrentMonth && shownDays >= 3 && shownDays < monthTotal
      ? (spent / shownDays) * monthTotal
      : null
    const days = Math.max(current.length, previous.length, monthTotal)
    const points: PacePoint[] = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      current: i < shownDays ? current[i] : null,
      previous: i < previous.length ? previous[i] : null,
      // Two anchors (today → month end); the line draws straight between them.
      projection: projectedTotal === null
        ? null
        : i === shownDays - 1 ? spent : i === monthTotal - 1 ? projectedTotal : null,
    }))
    const prevAtSameDay = previous[Math.min(shownDays, previous.length) - 1] ?? 0

    return {
      data: points,
      amountSoFar: spent,
      paceDelta: spent - prevAtSameDay,
      projected: projectedTotal,
      prevTotal: previous[previous.length - 1] ?? 0,
      elapsedDays: shownDays,
      totalDays: monthTotal,
    }
  }, [transactions, selectedDate, dateBasis, isIncome, includeCommitments])

  const higherThanPrevious = paceDelta > 0
  const deltaIsGood = isIncome ? higherThanPrevious : !higherThanPrevious
  const hasPaceData = amountSoFar > 0 || prevTotal > 0
  const DeltaIcon = higherThanPrevious ? ArrowUpRight : ArrowDownRight
  const title = titleOverride ?? t(isIncome ? 'dashboard.incomePace' : 'dashboard.spendingPace')
  const previousColor = '#c9c9d3'
  // Day 1, today and the last day — enough to read the month without clutter.
  const xTicks = Array.from(new Set([1, elapsedDays, totalDays])).filter((d) => d >= 1)

  const caption = !hasPaceData
    ? t(isIncome ? 'dashboard.noIncomePace' : 'dashboard.noSpendingPace')
    : projected !== null
      ? t(isIncome ? 'dashboard.incomeProjection' : 'dashboard.spendingProjection', {
          projected: formatCurrency(projected),
          previous: formatCurrency(prevTotal),
        })
      : t('dashboard.previousPace', { previous: formatCurrency(prevTotal) })

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={3} h="full">
        {/* Header */}
        <HStack justify="space-between" align="flex-start" gap={2}>
          <Box minW={0}>
            <Text fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
              {title}
            </Text>
            <HStack align="baseline" spacing={2} mt={0.5}>
              <Text fontSize="2xl" fontWeight={700} letterSpacing="-0.02em" lineHeight={1.15} color="var(--pb-ink)">
                {formatCurrency(amountSoFar)}
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-faint)">
                {t('dashboard.byDay', { day: elapsedDays })}
              </Text>
            </HStack>
          </Box>

          {onDismiss && (
            <IconButton
              aria-label={t('dashboard.removeChart', { title })}
              title={t('dashboard.removeChart', { title })}
              icon={<X size={14} />}
              onClick={onDismiss}
              variant="ghost"
              size="xs"
              minW="28px"
              w="28px"
              h="28px"
              borderRadius="full"
              color="var(--pb-ink-faint)"
              _hover={{ color: 'var(--pb-ink)', bg: 'var(--pb-surface-2)' }}
              _focusVisible={{ boxShadow: '0 0 0 3px var(--nu-brand-tint, #f3e8fc)' }}
            />
          )}
        </HStack>

        {hasPaceData && (
          <HStack
            alignSelf="flex-start"
            spacing={1}
            px={2}
            py={0.5}
            borderRadius="full"
            bg={deltaIsGood ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
            color={deltaIsGood ? 'var(--pb-income)' : 'var(--pb-coral)'}
          >
            <DeltaIcon size={12} strokeWidth={2.4} />
            <Text fontSize="xs" fontWeight={600}>
              {t('dashboard.vsLastMonth', { amount: formatCurrency(Math.abs(paceDelta)) })}
            </Text>
          </HStack>
        )}

        {/* Chart */}
        <Box
          h="168px"
          w="full"
          px={1}
          pt={3}
          borderRadius="14px"
          bg="var(--nu-page, #ffffff)"
          role="img"
          aria-label={t('dashboard.paceChartAria', {
            title,
            current: formatCurrency(amountSoFar),
            day: elapsedDays,
            previous: formatCurrency(prevTotal),
          })}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 14, left: 14, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={nu.brand} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={nu.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                ticks={xTicks}
                tick={{ fontSize: 11, fill: nu.inkFaint }}
                axisLine={{ stroke: nu.hair }}
                tickLine={false}
                interval={0}
                tickMargin={6}
              />
              <YAxis hide domain={[0, 'dataMax']} />
              <Tooltip
                cursor={{ stroke: nu.hair2, strokeWidth: 1 }}
                content={(props) => <PaceTooltip active={props.active} payload={props.payload} label={props.label} />}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke={previousColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: previousColor, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={!reduce}
              />
              <Line
                type="linear"
                dataKey="projection"
                stroke={nu.brand}
                strokeOpacity={0.55}
                strokeWidth={2}
                strokeDasharray="4 5"
                strokeLinecap="round"
                dot={false}
                activeDot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke={nu.brand}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill={`url(#${gradientId})`}
                connectNulls={false}
                isAnimationActive={!reduce}
                // Only today's point gets a marker: a brand dot with a white ring.
                dot={(props: { cx?: number; cy?: number; index?: number }) =>
                  props.index === elapsedDays - 1 && props.cx != null && props.cy != null ? (
                    <circle key="today" cx={props.cx} cy={props.cy} r={5} fill={nu.brand} stroke="#ffffff" strokeWidth={2.5} />
                  ) : (
                    <g key={`d${props.index}`} />
                  )}
                activeDot={{ r: 5, fill: nu.brand, stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend — identity is never colour-only */}
        <HStack spacing={4} flexWrap="wrap" fontSize="xs" color="var(--pb-ink-soft)">
          <LegendItem color={nu.brand} label={t('period.thisMonth')} />
          <LegendItem color={previousColor} label={t('period.lastMonth')} />
          {projected !== null && <LegendItem color={nu.brand} label={t('dashboard.paceProjection')} dashed />}
        </HStack>

        <Text fontSize="xs" color="var(--pb-ink-soft)" lineHeight={1.5}>
          {caption}
        </Text>
      </VStack>
    </Panel>
  )

  function PaceTooltip({ active, payload, label }: {
    active?: boolean
    payload?: ReadonlyArray<{ payload?: unknown }>
    label?: string | number
  }) {
    if (!active || !payload?.length) return null
    const point = payload[0]?.payload as PacePoint | undefined
    if (!point) return null
    const rows = [
      { key: 'current', label: t('period.thisMonth'), value: point.current, color: nu.brand },
      { key: 'previous', label: t('period.lastMonth'), value: point.previous, color: previousColor },
      {
        key: 'projection',
        label: t('dashboard.paceProjection'),
        // Only meaningful on the projected month-end point.
        value: point.current == null ? point.projection : null,
        color: nu.brand,
      },
    ].filter((row) => row.value != null)
    if (rows.length === 0) return null
    return (
      <Box bg="white" borderRadius="12px" px={3} py={2} boxShadow="0 8px 24px -10px rgba(31,31,36,0.28)" minW="150px">
        <Text fontSize="xs" fontWeight={700} color="var(--pb-ink)" mb={1}>
          {t('dashboard.chartDay', { day: Number(label) })}
        </Text>
        {rows.map((row) => (
          <HStack key={row.key} justify="space-between" spacing={3} fontSize="xs">
            <HStack spacing={1.5}>
              <Box w="8px" h="8px" borderRadius="full" bg={row.color} opacity={row.key === 'projection' ? 0.55 : 1} />
              <Text color="var(--pb-ink-soft)">{row.label}</Text>
            </HStack>
            <Text fontWeight={600} color="var(--pb-ink)">{formatCurrency(Number(row.value))}</Text>
          </HStack>
        ))}
      </Box>
    )
  }
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <HStack spacing={1.5}>
      <Box
        w="14px"
        h={0}
        borderTop={`2.5px ${dashed ? 'dashed' : 'solid'} ${color}`}
        opacity={dashed ? 0.55 : 1}
        borderRadius="full"
      />
      <Text>{label}</Text>
    </HStack>
  )
}
