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
  deriveTopCategory,
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

function selectedDateLabel(date: Date, period: 'day' | 'week' | 'month' | 'year'): string {
  if (period === 'month') {
    return date.toLocaleDateString('en-GB', { month: 'long' })
  }

  if (period === 'week') {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const weekday = utcDate.getUTCDay() || 7
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - weekday)
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
    const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
    return `Week ${week}`
  }

  if (period === 'day') {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
  }

  return String(date.getFullYear())
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

  // Expenses are shown only when their real transaction date is available.
  const spendingTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'EXPENSE' && Boolean(transaction.transactionDate)),
    [transactions],
  )

  // Behaviour is locked to the purchase-date ("activity") lens.
  const [state, dispatch] = useReducer(txReducer, {
    ...initialTxState,
    selectedDay: isoOf(new Date()),
  })
  const [drawerTxn, setDrawerTxn] = useState<TxnVM | null>(null)

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
    dispatch({ type: 'SET_DAY', day: isCurrentPeriod ? isoOf(new Date()) : null })
  }, [selectedDate, selectedPeriod, isCurrentPeriod])

  const rhythm = useMemo(() => deriveRhythm(vm), [vm])
  const habit = useMemo(() => deriveHabit(vm), [vm])
  const momentum = useMemo(() => deriveMomentum(vm), [vm])
  const shift = useMemo(() => deriveCategoryShift(vm, prevVm), [vm, prevVm])
  const topCategory = useMemo(() => deriveTopCategory(vm), [vm])
  const spendBreakdown = useMemo(() => spendByCategory(vm), [vm])

  const expense = useMemo(() => aggregateSide(periodData.transactions, 'expense'), [periodData.transactions])

  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )
  const groups = useMemo(() => buildLedger(vm, state), [vm, state])

  const periodLabel = formatLabel()
  const narrativePeriodLabel = selectedDateLabel(selectedDate, selectedPeriod)

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

        {/* Day-to-day summary first */}
        <MotionBox variants={riseV} mb="clamp(1.15rem,2.4vw,1.55rem)">
          <DayToDaySummary
            expense={periodData.expense}
            periodLabel={periodLabel}
            narrativePeriodLabel={narrativePeriodLabel}
          />
        </MotionBox>

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
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
              title="Spending"
              caption="Daily expenses by transaction date"
            />
          )}
        </MotionBox>

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          <SoFarBreakdown
            spend={spendBreakdown}
            earnings={[]}
            showEarnings={false}
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
              availableFilters={['all', 'out', 'deferred']}
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
          <Distribution expense={expense} income={[]} view="behaviour" periodLabel={periodLabel} initialSide="expense" />
        </MotionBox>

        {/* Pattern insights close the page, just before the footer */}
        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <InsightsPanel
            periodWord={periodWord(selectedPeriod)}
            shift={shift}
            topCategory={topCategory}
            rhythm={rhythm}
            habit={habit}
            earnings={null}
          />
        </MotionBox>

      </MotionBox>

      <TransactionDrawer txn={drawerTxn} onClose={() => setDrawerTxn(null)} />
    </Box>
  )
}
