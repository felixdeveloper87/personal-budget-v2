import { Box, Grid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { getPreviousPeriodDate, usePeriodData } from '../../hooks/usePeriodData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import { fmtCurrency } from '../dashboard/components/format'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import DailyChart, { type ChartDay } from '../transactions/components/DailyChart'
import ActivityDayModal from '../transactions/components/ActivityDayModal'
import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import { toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { earningsBySource } from '../behaviour/insights'

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildDays(start: Date, end: Date): ChartDay[] {
  const days: ChartDay[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  while (current <= last && days.length < 400) {
    days.push({ iso: isoOf(current), date: new Date(current) })
    current.setDate(current.getDate() + 1)
  }
  return days
}

export default function EarningsPage() {
  const reduce = useReducedMotion() ?? false
  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
    isCurrentPeriod,
  } = usePeriodNavigator()
  const { transactions, loading } = useDashboardData(selectedDate, selectedPeriod)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const periodData = usePeriodData(transactions, null, selectedPeriod, selectedDate, 'activity')
  const previousDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const previousPeriodData = usePeriodData(transactions, null, selectedPeriod, previousDate, 'activity')
  const sources = useMemo(
    () => earningsBySource(toViewModel(periodData.transactions)),
    [periodData.transactions],
  )
  const incomeTransactions = useMemo<TxnVM[]>(
    () => toViewModel(periodData.transactions).filter((transaction) => transaction.type === 'in'),
    [periodData.transactions],
  )
  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )
  const selectedDayIncomes = useMemo(
    () => selectedDay ? incomeTransactions.filter((transaction) => transaction.purchaseDate === selectedDay) : [],
    [incomeTransactions, selectedDay],
  )

  const periodLabel = formatLabel()
  const difference = periodData.income - previousPeriodData.income
  const comparisonCopy = previousPeriodData.income === 0
    ? 'No earnings recorded in the previous period.'
    : difference === 0
      ? `The same as the previous period: ${fmtCurrency(previousPeriodData.income)}.`
      : `${fmtCurrency(Math.abs(difference))} ${difference > 0 ? 'more' : 'less'} than the previous period.`

  return (
    <Box maxW="appContent" mx="auto" px="clamp(1rem,4vw,1.9rem)" py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial={reduce ? false : 'hidden'} animate="show">
        <MotionBox variants={riseV}>
          <PeriodNavBar
            selectedPeriod={selectedPeriod}
            label={periodLabel}
            isCurrent={isCurrentPeriod}
            onPeriodChange={onPeriodChange}
            onNavigate={navigatePeriod}
            onGoToToday={goToToday}
          />
        </MotionBox>

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          {loading ? (
            <Skeleton height="180px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <EarningsOverview
              total={periodData.income}
              previousTotal={previousPeriodData.income}
              comparisonCopy={comparisonCopy}
              periodLabel={periodLabel}
            />
          )}
        </MotionBox>

        <MotionBox variants={riseV}>
          {loading ? (
            <Skeleton height="300px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <EarningsSources
              sources={sources}
              periodLabel={periodLabel}
            />
          )}
        </MotionBox>

        <MotionBox variants={riseV} mt="clamp(1.4rem,3vw,2rem)" mb={selectedDay ? "clamp(1.4rem,3vw,2rem)" : 0}>
          {loading ? (
            <Skeleton height="230px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <DailyChart
              days={days}
              txns={incomeTransactions}
              view="behaviour"
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay((current) => current === day ? null : day)}
              hlRhythm={false}
              hlMomentum={false}
              rhythmWeekday={null}
              monthLabel={periodLabel}
              reduce={reduce}
              title="Earnings"
              caption="Daily income by activity date"
              instruction="Select a day to view its earnings"
            />
          )}
        </MotionBox>

        {selectedDay && (
          <SelectedDayIncomes
            day={selectedDay}
            incomes={selectedDayIncomes}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </MotionBox>
    </Box>
  )
}

function SelectedDayIncomes({
  day,
  incomes,
  onClose,
}: {
  day: string
  incomes: TxnVM[]
  onClose: () => void
}) {
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)
  const dayLabel = new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <ActivityDayModal
      isOpen
      onClose={onClose}
      label={`Earnings on ${dayLabel}`}
      tone="income"
      title={dayLabel}
      totalLabel="Received"
      total={fmtCurrency(total)}
      count={incomes.length}
      dateContext="Activity date"
    >
      <VStack align="stretch" spacing={2}>
        {incomes.length === 0 ? (
          <Box border="1px dashed var(--pb-hair-2)" borderRadius="14px" p={4} bg="var(--pb-surface-2)">
            <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-soft)">
              No earnings recorded on this day.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={2}>
            {incomes.map((income) => (
              <ActivityDayTransactionRow key={income.id} transaction={income} tone="income" />
            ))}
          </VStack>
        )}
      </VStack>
    </ActivityDayModal>
  )
}

function EarningsOverview({
  total,
  previousTotal,
  comparisonCopy,
  periodLabel,
}: {
  total: number
  previousTotal: number
  comparisonCopy: string
  periodLabel: string
}) {
  const change = total - previousTotal
  const changeColor = change >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)'

  return (
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="18px" boxShadow="var(--pb-shadow)" p="clamp(1.1rem, 2.4vw, 1.5rem)">
      <VStack align="stretch" spacing={4}>
        <VStack align="stretch" spacing={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Earnings - {periodLabel}
          </Text>
          <Text fontSize="sm" color="var(--pb-ink-soft)">Income by transaction date</Text>
        </VStack>

        <Text fontFamily="var(--pb-serif)" fontSize="clamp(1.2rem, 2.6vw, 1.55rem)" fontWeight={400} lineHeight={1.25} color="var(--pb-ink)" maxW="48ch">
          {total > 0 ? (
            <>You earned <Text as="em" color="var(--pb-income)">{fmtCurrency(total)}</Text> in {periodLabel}.</>
          ) : (
            <>No earnings recorded in {periodLabel}.</>
          )}
        </Text>

        <Text pt={3} borderTop="1px solid var(--pb-hair)" fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.08em" textTransform="uppercase" color={changeColor}>
          {comparisonCopy}
        </Text>
      </VStack>
    </Box>
  )
}

function EarningsSources({
  sources,
  periodLabel,
}: {
  sources: ReturnType<typeof earningsBySource>
  periodLabel: string
}) {
  return (
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="22px" boxShadow="var(--pb-shadow)" p="clamp(1.1rem,2.5vw,1.5rem)">
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Earnings by source
          </Text>
          <Text mt={1} fontSize="sm" color="var(--pb-ink-soft)">
            Grouped by transaction description in {periodLabel}.
          </Text>
        </Box>

        {sources.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)" py={3}>
            No earnings recorded in this period.
          </Text>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap="0.7rem">
            {sources.map((source) => (
              <Box key={source.name} bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" borderRadius="14px" p="1rem">
                <VStack align="stretch" spacing={2}>
                  <Text fontFamily="var(--pb-serif)" fontSize="lg" color="var(--pb-ink)" noOfLines={1}>
                    <Text as="span" color="var(--pb-ink-faint)">from </Text>{source.name}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.1em" color="var(--pb-ink-faint)">
                    x{source.count}
                  </Text>
                  <Text fontFamily="var(--pb-serif)" fontSize="1.45rem" fontWeight={500} color="var(--pb-income)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmtCurrency(source.total)}
                  </Text>
                </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>
    </Box>
  )
}
