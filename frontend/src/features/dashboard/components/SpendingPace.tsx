import { useId, useMemo } from 'react'
import { Box, HStack, IconButton, Text, VStack, useColorMode } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react'
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
import { cumulativeDailyAmount, daysInMonth } from '../insights'
import Panel from './Panel'
import { useI18n } from '../../../i18n'
import { DARK_PALETTE, LIGHT_PALETTE } from '../../../palette'

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

/**
 * Cumulative spend this month plotted against last month on the same
 * day-of-month scale, so "am I ahead of or behind last month?" is one glance.
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
  const { colorMode } = useColorMode()
  const palette = colorMode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE
  const isIncome = kind === 'income'

  // recharts writes stroke/fill as SVG attributes, where CSS var() is
  // unreliable — so resolve concrete colours per color mode here.
  const c = {
    current: isIncome ? palette.income : palette.coral,
    previous: palette['ink-faint'],
    grid: palette.hair,
    tick: palette['ink-faint'],
    tooltipBg: palette.solid,
    tooltipBorder: palette['hair-2'],
    tooltipText: palette.ink,
  }

  const { data, amountSoFar, paceDelta, projected, prevTotal, elapsedDays } = useMemo(() => {
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
      amountSoFar: spent,
      paceDelta: spent - prevAtSameDay,
      projected: isCurrentMonth && shownDays >= 3 ? (spent / shownDays) * monthTotal : null,
      prevTotal: previous[previous.length - 1] ?? 0,
      elapsedDays: shownDays,
    }
  }, [transactions, selectedDate, dateBasis, isIncome, includeCommitments])

  const higherThanPrevious = paceDelta > 0
  const hasPaceData = amountSoFar > 0 || prevTotal > 0
  const DeltaIcon = higherThanPrevious ? ArrowUpRight : ArrowDownRight
  const deltaColor = isIncome
    ? higherThanPrevious ? 'var(--pb-income-2)' : 'var(--pb-coral)'
    : higherThanPrevious ? 'var(--pb-coral)' : 'var(--pb-income-2)'
  const title = titleOverride ?? t(isIncome ? 'dashboard.incomePace' : 'dashboard.spendingPace')

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
              {title}
            </Text>
            <HStack align="baseline" spacing={3} flexWrap="wrap">
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="xl"
                fontWeight={500}
                color="var(--pb-ink)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCurrency(amountSoFar)}
              </Text>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.08em">
                {t('dashboard.byDay', { day: elapsedDays })}
              </Text>
            </HStack>
          </VStack>

          {(hasPaceData || onDismiss) && (
            <HStack spacing={1} flexShrink={0}>
              {hasPaceData && (
                <HStack
                  spacing={1}
                  px={2}
                  py="2px"
                  borderRadius="999px"
                  color={deltaColor}
                >
                  <DeltaIcon size={12} />
                  <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {t('dashboard.vsLastMonth', { amount: formatCurrency(Math.abs(paceDelta)) })}
                  </Text>
                </HStack>
              )}
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
                  border="1px solid transparent"
                  _hover={{
                    color: 'var(--pb-coral)',
                    bg: 'var(--pb-surface-2)',
                    borderColor: 'var(--pb-hair)',
                  }}
                  _focusVisible={{ boxShadow: '0 0 0 3px var(--pb-tint-coral)' }}
                />
              )}
            </HStack>
          )}
        </HStack>

        {/* Chart */}
        <Box
          h="180px"
          w="full"
          role="img"
          aria-label={t('dashboard.paceChartAria', {
            title,
            current: formatCurrency(amountSoFar),
            day: elapsedDays,
            previous: formatCurrency(prevTotal),
          })}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(v: number) => formatCurrency(v, { notation: 'compact' })}
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
                labelFormatter={(day) => t('dashboard.chartDay', { day: Number(day) })}
                formatter={(value: number | string, name: string) => [
                  formatCurrency(Number(value), { minimumFractionDigits: 2 }),
                  name === 'current' ? t('period.thisMonth') : t('period.lastMonth'),
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
                fill={`url(#${gradientId})`}
                connectNulls={false}
                isAnimationActive={!reduce}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Caption */}
        <Text display={isIncome ? 'none' : undefined} fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-soft)" lineHeight={1.5}>
          {!hasPaceData
            ? t('dashboard.noSpendingPace')
            : projected !== null
            ? t('dashboard.spendingProjection', { projected: formatCurrency(projected), previous: formatCurrency(prevTotal) })
            : t('dashboard.previousPace', { previous: formatCurrency(prevTotal) })}
        </Text>
        {isIncome && (
          <Text fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-soft)" lineHeight={1.5}>
            {!hasPaceData
              ? t('dashboard.noIncomePace')
              : projected !== null
              ? t('dashboard.incomeProjection', { projected: formatCurrency(projected), previous: formatCurrency(prevTotal) })
              : t('dashboard.previousPace', { previous: formatCurrency(prevTotal) })}
          </Text>
        )}
      </VStack>
    </Panel>
  )
}
