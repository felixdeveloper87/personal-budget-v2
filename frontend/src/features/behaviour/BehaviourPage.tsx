import { useEffect, useMemo, useState } from 'react'
import { Box, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData, getPreviousPeriodDate } from '../../hooks/usePeriodData'
import { useI18n } from '../../i18n'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import TopMerchants from '../dashboard/components/TopMerchants'

import ActivityDayModal from '../transactions/components/ActivityDayModal'
import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import ActivityIntensityStrip, { type ChartDay } from '../transactions/components/ActivityIntensityStrip'
import {
  deriveHabit,
  deriveMomentum,
  deriveRhythm,
  toViewModel,
} from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

import InsightsPanel from './components/InsightsPanel'
import DayToDaySummary from './components/DayToDaySummary'
import {
  deriveCategoryShift,
  deriveTopCategory,
} from './insights'

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function buildDays(start: Date, end: Date): ChartDay[] {
  const days: ChartDay[] = []
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  let guard = 0
  while (cur <= last && guard < 400) {
    days.push({ iso: isoOf(cur), date: new Date(cur) })
    cur.setDate(cur.getDate() + 1)
    guard += 1
  }
  return days
}

type I18nApi = ReturnType<typeof useI18n>

function periodNavigationLabel(
  date: Date,
  period: 'day' | 'week' | 'month' | 'year',
  locale: I18nApi['locale'],
  formatDate: I18nApi['formatDate'],
): string {
  if (period === 'month') {
    return formatDate(date, { month: 'short', year: 'numeric' }).toLocaleUpperCase(locale)
  }
  if (period === 'day') {
    return formatDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }
  if (period === 'week') {
    const start = new Date(date)
    const day = start.getDay()
    start.setDate(start.getDate() - day + (day === 0 ? -6 : 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const shortDate = (value: Date) => formatDate(value, { day: '2-digit', month: '2-digit' })
    return `${shortDate(start)} – ${shortDate(end)}`
  }
  return String(date.getFullYear())
}

function selectedDateLabel(
  date: Date,
  period: 'day' | 'week' | 'month' | 'year',
  formatDate: I18nApi['formatDate'],
  t: I18nApi['t'],
): string {
  if (period === 'month') {
    return formatDate(date, { month: 'long' })
  }

  if (period === 'week') {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const weekday = utcDate.getUTCDay() || 7
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday)
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
    const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
    return t('cashflow.weekNumber', { week })
  }

  if (period === 'day') {
    return formatDate(date, { day: '2-digit', month: '2-digit' })
  }

  return String(date.getFullYear())
}

export default function BehaviourPage() {
  const { locale, t, formatDate } = useI18n()
  const reduce = useReducedMotion() ?? false

  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    isCurrentPeriod,
  } = usePeriodNavigator()

  const { transactions, loading } = useDashboardData(selectedDate, selectedPeriod)

  // Expenses are shown only when their real transaction date is available.
  const spendingTransactions = useMemo(
    () => transactions.filter(
      (transaction) =>
        transaction.type === 'EXPENSE' &&
        Boolean(transaction.transactionDate) &&
        !transaction.isInstallment &&
        transaction.installmentPlanId == null,
    ),
    [transactions],
  )

  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null)

  const periodData = usePeriodData(spendingTransactions, null, selectedPeriod, selectedDate, 'activity')
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])

  // Previous period, same lens — powers the month-over-month "spending more on X" insight.
  const prevDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const prevPeriodData = usePeriodData(spendingTransactions, null, selectedPeriod, prevDate, 'activity')
  const prevVm = useMemo<TxnVM[]>(
    () => toViewModel(prevPeriodData.transactions),
    [prevPeriodData.transactions],
  )

  useEffect(() => {
    setSelectedChartDay(null)
  }, [selectedDate, selectedPeriod])

  const rhythm = useMemo(() => deriveRhythm(vm), [vm])
  const habit = useMemo(() => deriveHabit(vm), [vm])
  const momentum = useMemo(() => deriveMomentum(vm), [vm])
  const shift = useMemo(() => deriveCategoryShift(vm, prevVm), [vm, prevVm])
  const topCategory = useMemo(() => deriveTopCategory(vm), [vm])

  const expense = useMemo(() => aggregateSide(periodData.transactions, 'expense'), [periodData.transactions])
  const previousExpense = useMemo(
    () => aggregateSide(prevPeriodData.transactions, 'expense'),
    [prevPeriodData.transactions],
  )

  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )
  const selectedDayExpenses = useMemo(
    () => selectedChartDay ? vm.filter((transaction) => transaction.purchaseDate === selectedChartDay) : [],
    [vm, selectedChartDay],
  )

  const periodLabel = periodNavigationLabel(selectedDate, selectedPeriod, locale, formatDate)
  const narrativePeriodLabel = selectedDateLabel(selectedDate, selectedPeriod, formatDate, t)

  const selectDay = (iso: string) => {
    setSelectedChartDay((current) => current === iso ? null : iso)
  }

  return (
    <Box maxW="appContent" mx="auto" px="clamp(1rem,4vw,1.9rem)" py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial={reduce ? false : 'hidden'} animate="show">

        {/* Day-to-day summary first */}
        <MotionBox variants={riseV} mb="clamp(1.15rem,2.4vw,1.55rem)">
          <DayToDaySummary
            expense={periodData.expense}
            periodLabel={periodLabel}
            narrativePeriodLabel={narrativePeriodLabel}
            periodNavigator={(
              <PeriodNavBar
                embedded
                selectedPeriod={selectedPeriod}
                label={periodLabel}
                isCurrent={isCurrentPeriod}
                onPeriodChange={onPeriodChange}
                onNavigate={navigatePeriod}
                onGoToToday={goToToday}
              />
            )}
          />
        </MotionBox>

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          {loading ? (
            <Skeleton height="230px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <ActivityIntensityStrip
              days={days}
              txns={vm}
              selectedDay={selectedChartDay}
              onSelectDay={selectDay}
              periodLabel={periodLabel}
              tone="expense"
              dateKey="purchaseDate"
              title={t('behaviour.activity.title')}
              caption={t('behaviour.activity.caption')}
            />
          )}
        </MotionBox>

        {selectedChartDay && (
          <SelectedDayExpenses
            day={selectedChartDay}
            expenses={selectedDayExpenses}
            onClose={() => setSelectedChartDay(null)}
          />
        )}

        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <Distribution
            expense={expense}
            previousExpense={previousExpense}
            periodLabel={periodLabel}
          />
        </MotionBox>

        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          {loading ? (
            <Skeleton height="260px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <TopMerchants transactions={periodData.transactions} />
          )}
        </MotionBox>

        {/* Pattern insights close the page, just before the footer */}
        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <InsightsPanel
            periodWord={t(`cashflow.periodWord.${selectedPeriod}`)}
            shift={shift}
            topCategory={topCategory}
            rhythm={rhythm}
            habit={habit}
            earnings={null}
          />
        </MotionBox>

      </MotionBox>

    </Box>
  )
}

function SelectedDayExpenses({
  day,
  expenses,
  onClose,
}: {
  day: string
  expenses: TxnVM[]
  onClose: () => void
}) {
  const { t, formatCurrency, formatDate } = useI18n()
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const dayLabel = formatDate(day, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <ActivityDayModal
      isOpen
      onClose={onClose}
      label={t('behaviour.day.label', { date: dayLabel })}
      tone="expense"
      title={dayLabel}
      totalLabel={t('behaviour.day.total')}
      total={formatCurrency(total)}
      count={expenses.length}
      dateContext={t('behaviour.day.dateContext')}
    >
      <VStack align="stretch" spacing={2}>
        {expenses.length === 0 ? (
          <Box border="1px dashed var(--pb-hair-2)" borderRadius="14px" p={4} bg="var(--pb-surface-2)">
            <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-soft)">
              {t('behaviour.day.empty')}
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={2}>
            {expenses.map((expense) => (
              <ActivityDayTransactionRow key={expense.id} transaction={expense} tone="expense" />
            ))}
          </VStack>
        )}
      </VStack>
    </ActivityDayModal>
  )
}
