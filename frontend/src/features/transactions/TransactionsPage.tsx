import { useEffect, useMemo, useReducer, useState } from 'react'
import { Box, Grid, Skeleton } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData } from '../../hooks/usePeriodData'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PaperFooter from '../dashboard/components/PaperFooter'
import { PageHeader } from '../../components/ui'
import { List } from '../../components/ui/icons'
import ViewBar from './components/ViewBar'
import PeriodToolbar from './components/PeriodToolbar'
import DailyChart, { type ChartDay } from './components/DailyChart'
import ActivityPane from './components/ActivityPane'
import PatternsAside from './components/PatternsAside'
import TransactionDrawer from './components/TransactionDrawer'

import type { TxnVM } from './transactions.types'
import { initialTxState } from './transactions.types'
import {
  buildLedger,
  deriveHabit,
  deriveMomentum,
  deriveRhythm,
  toViewModel,
  txReducer,
} from './transactions.utils'

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

export default function TransactionsPage() {
  const reduce = useReducedMotion() ?? false

  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator()

  const { transactions, loading } = useDashboardData(selectedDate, selectedPeriod)

  const [state, dispatch] = useReducer(txReducer, initialTxState)
  const [drawerTxn, setDrawerTxn] = useState<TxnVM | null>(null)

  // The view toggle swaps the page's time axis ("two clocks"): Behaviour shows
  // each transaction on its purchase day, Payments on the day money clears. This
  // drives membership too — a card purchase that settles next month leaves the
  // Payments view of this month, exactly like the dashboard's date basis.
  const basis = state.view === 'behaviour' ? 'activity' : 'cash-flow'
  const periodData = usePeriodData(transactions, null, selectedPeriod, selectedDate, basis)
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])

  // Behavioural patterns are always about *purchase* behaviour, so they read from
  // the purchase-based set regardless of which view is active.
  const behaviourData = usePeriodData(transactions, null, selectedPeriod, selectedDate, 'activity')
  const behaviourVm = useMemo<TxnVM[]>(
    () => toViewModel(behaviourData.transactions),
    [behaviourData.transactions],
  )

  // Reset the day filter when the navigated period or view axis changes.
  useEffect(() => {
    dispatch({ type: 'SET_DAY', day: null })
  }, [selectedDate, selectedPeriod, state.view])

  const rhythm = useMemo(() => deriveRhythm(behaviourVm), [behaviourVm])
  const habit = useMemo(() => deriveHabit(behaviourVm), [behaviourVm])
  const momentum = useMemo(() => deriveMomentum(behaviourVm), [behaviourVm])

  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )

  const groups = useMemo(() => buildLedger(vm, state), [vm, state])

  const now = new Date()
  const isCurrent =
    selectedPeriod === 'month' &&
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth()

  const monthLabel = formatLabel()

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
      <MotionBox
        variants={containerV}
        initial={reduce ? false : 'hidden'}
        animate="show"
      >
        <MotionBox variants={riseV} mb="1.3rem">
          <PageHeader
            icon={List}
            title="Transactions"
            subtitle="Activity and spending patterns for the selected period."
          />
        </MotionBox>

        <MotionBox variants={riseV}>
          <ViewBar view={state.view} onChange={(v) => dispatch({ type: 'SET_VIEW', view: v })} />
        </MotionBox>

        <MotionBox variants={riseV}>
          <PeriodToolbar
            selectedPeriod={selectedPeriod}
            label={monthLabel}
            isCurrent={isCurrent}
            onPeriodChange={onPeriodChange}
            onNavigate={navigatePeriod}
            onGoToToday={goToToday}
          />
        </MotionBox>

        {/* Daily chart */}
        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          {loading ? (
            <Skeleton
              height="230px"
              borderRadius="22px"
              startColor="var(--pb-surface-2)"
              endColor="var(--pb-surface-3)"
            />
          ) : (
            <DailyChart
              days={days}
              txns={vm}
              view={state.view}
              selectedDay={state.selectedDay}
              onSelectDay={selectDay}
              hlRhythm={state.hlRhythm}
              hlMomentum={state.hlMomentum}
              rhythmWeekday={rhythm ? rhythm.weekday : null}
              monthLabel={monthLabel}
              reduce={reduce}
            />
          )}
        </MotionBox>

        {/* Body grid */}
        <Grid
          className="body-grid"
          templateColumns={{ base: '1fr', lg: '1fr 330px' }}
          gap={{ base: 6, lg: 8 }}
          alignItems="start"
        >
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
          <PaperFooter />
        </MotionBox>
      </MotionBox>

      <TransactionDrawer txn={drawerTxn} onClose={() => setDrawerTxn(null)} />
    </Box>
  )
}
