import { useEffect, useMemo, useReducer, useState } from 'react'
import { Box, Grid, Skeleton } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData, getPreviousPeriodDate } from '../../hooks/usePeriodData'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'

import DailyChart, { type ChartDay } from '../transactions/components/DailyChart'
import ActivityPane from '../transactions/components/ActivityPane'
import PatternsAside from '../transactions/components/PatternsAside'
import TransactionDrawer from '../transactions/components/TransactionDrawer'
import {
  buildLedger,
  deriveHabit,
  deriveMomentum,
  deriveRhythm,
  toViewModel,
  txReducer,
} from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { initialTxState } from '../transactions/transactions.types'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

import InsightsPanel from './components/InsightsPanel'
import DayToDaySummary from './components/DayToDaySummary'
import SoFarBreakdown from './components/SoFarBreakdown'
import {
  deriveCategoryShift,
  deriveEarnings,
  deriveTopCategory,
  earningsBySource,
  periodWord,
  spendByCategory,
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

export default function BehaviourPage() {
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

  // Behaviour is the day-to-day lens: variable spending and variable income
  // (e.g. daily gig earnings). Fixed/recurring items and installment charges
  // are commitments, not behaviour — they live on Payments / Commitments.
  // Card statements (faturas) never appear here by construction: they are a
  // Payments-page synthetic row; card purchases show on their purchase date.
  const dayToDayTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          !t.isInstallment &&
          t.installmentPlanId == null &&
          !t.isRecurring &&
          t.recurringTransactionId == null,
      ),
    [transactions],
  )

  // Behaviour is locked to the purchase-date ("activity") lens.
  const [state, dispatch] = useReducer(txReducer, {
    ...initialTxState,
    selectedDay: isoOf(new Date()),
  })
  const [drawerTxn, setDrawerTxn] = useState<TxnVM | null>(null)

  const periodData = usePeriodData(dayToDayTransactions, null, selectedPeriod, selectedDate, 'activity')
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])

  // Previous period, same lens — powers the month-over-month "spending more on X" insight.
  const prevDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const prevPeriodData = usePeriodData(dayToDayTransactions, null, selectedPeriod, prevDate, 'activity')
  const prevVm = useMemo<TxnVM[]>(
    () => toViewModel(prevPeriodData.transactions),
    [prevPeriodData.transactions],
  )

  useEffect(() => {
    dispatch({ type: 'SET_DAY', day: isCurrentPeriod ? isoOf(new Date()) : null })
  }, [selectedDate, selectedPeriod, isCurrentPeriod])

  const rhythm = useMemo(() => deriveRhythm(vm), [vm])
  const habit = useMemo(() => deriveHabit(vm), [vm])
  const momentum = useMemo(() => deriveMomentum(vm), [vm])
  const shift = useMemo(() => deriveCategoryShift(vm, prevVm), [vm, prevVm])
  const topCategory = useMemo(() => deriveTopCategory(vm), [vm])
  const earnings = useMemo(() => deriveEarnings(vm), [vm])
  const spendBreakdown = useMemo(() => spendByCategory(vm), [vm])
  const earningsBreakdown = useMemo(() => earningsBySource(vm), [vm])

  // Days of the period already lived through — denominators for the per-day
  // averages (a month in progress shouldn't be divided by 30).
  const daysElapsed = useMemo(() => {
    const clip = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const today = clip(new Date())
    const start = clip(periodData.startDate)
    const end = today < periodData.endDate ? today : clip(periodData.endDate)
    if (end < start) return 0
    return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
  }, [periodData.startDate, periodData.endDate])

  const expense = useMemo(() => aggregateSide(periodData.transactions, 'expense'), [periodData.transactions])
  const income = useMemo(() => aggregateSide(periodData.transactions, 'income'), [periodData.transactions])

  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )
  const groups = useMemo(() => buildLedger(vm, state), [vm, state])

  const periodLabel = formatLabel()

  const selectDay = (iso: string) => {
    if (state.selectedDay === iso) {
      dispatch({ type: 'SET_DAY', day: null })
      return
    }
    dispatch({ type: 'SET_DAY', day: iso })
    if (window.matchMedia('(max-width:919px)').matches) {
      document.querySelector('.body-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

        {/* Cash flow first — the day-by-day picture leads the page */}
        <MotionBox variants={riseV} mb="clamp(1.15rem,2.4vw,1.55rem)">
          {loading ? (
            <Skeleton height="230px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <DailyChart
              days={days}
              txns={vm}
              view="behaviour"
              selectedDay={state.selectedDay}
              onSelectDay={selectDay}
              hlRhythm={state.hlRhythm}
              hlMomentum={state.hlMomentum}
              rhythmWeekday={rhythm ? rhythm.weekday : null}
              monthLabel={periodLabel}
              reduce={reduce}
            />
          )}
        </MotionBox>

        {/* Income / Spending / Net summary right under the chart */}
        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          <DayToDaySummary
            income={periodData.income}
            expense={periodData.expense}
            balance={periodData.balance}
            earnings={earnings}
            daysElapsed={daysElapsed}
            periodLabel={periodLabel}
          />
        </MotionBox>

        {/* "So far": spend per category · earnings per source (description) */}
        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          <SoFarBreakdown
            spend={spendBreakdown}
            earnings={earningsBreakdown}
            scopeLabel={
              isCurrentPeriod
                ? `so far this ${periodWord(selectedPeriod)}`
                : `in ${periodLabel}`
            }
          />
        </MotionBox>

        <Grid className="body-grid" templateColumns={{ base: '1fr', lg: '1fr 330px' }} gap={{ base: 6, lg: 8 }} alignItems="start">
          <MotionBox variants={riseV} minW={0}>
            <ActivityPane
              state={state}
              groups={groups}
              onSetQuery={(q) => dispatch({ type: 'SET_Q', q })}
              onSetFilter={(filter) => dispatch({ type: 'SET_FILTER', filter })}
              onClearDay={() => dispatch({ type: 'SET_DAY', day: null })}
              onOpen={setDrawerTxn}
              reduce={reduce}
            />
          </MotionBox>

          <MotionBox variants={riseV}>
            <PatternsAside
              state={state}
              rhythm={rhythm}
              habit={habit}
              momentum={momentum}
              onToggleRhythm={() => dispatch({ type: 'TOGGLE_RHYTHM' })}
              onToggleHabit={(category) => dispatch({ type: 'TOGGLE_HABIT', category })}
              onToggleMomentum={() => dispatch({ type: 'TOGGLE_MOMENTUM' })}
            />
          </MotionBox>
        </Grid>

        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <Distribution expense={expense} income={income} view="behaviour" periodLabel={periodLabel} initialSide="expense" />
        </MotionBox>

        {/* Pattern insights close the page, just before the footer */}
        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <InsightsPanel
            periodWord={periodWord(selectedPeriod)}
            shift={shift}
            topCategory={topCategory}
            rhythm={rhythm}
            habit={habit}
            earnings={earnings}
          />
        </MotionBox>

      </MotionBox>

      <TransactionDrawer txn={drawerTxn} onClose={() => setDrawerTxn(null)} />
    </Box>
  )
}
