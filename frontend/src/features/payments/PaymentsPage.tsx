import { useEffect, useMemo, useReducer, useState } from 'react'
import { Box, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData } from '../../hooks/usePeriodData'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import { fmtCurrency } from '../dashboard/components/format'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'

import DailyChart, { type ChartDay } from '../transactions/components/DailyChart'
import ActivityPane from '../transactions/components/ActivityPane'
import TransactionDrawer from '../transactions/components/TransactionDrawer'
import { buildLedger, collapseCardStatements, toViewModel, txReducer } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { initialTxState } from '../transactions/transactions.types'
import { listPaymentMethods } from '../../api'
import type { AppPage } from '../../components/layout/header/navigation.config'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

import UpcomingPayments from './components/UpcomingPayments'

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

interface PaymentsPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function PaymentsPage({ onPageChange }: PaymentsPageProps) {
  const reduce = useReducedMotion() ?? false

  // Credit-card id → name, used to fold a card's charges into one fatura row.
  const [cardNames, setCardNames] = useState<Map<number, string>>(() => new Map())
  useEffect(() => {
    let alive = true
    listPaymentMethods()
      .then((methods) => {
        if (!alive) return
        const map = new Map<number, string>()
        for (const m of methods) {
          if (m.type === 'CREDIT_CARD') map.set(m.id, m.name)
        }
        setCardNames(map)
      })
      .catch(() => {
        // A failed lookup just means cards render as individual rows — no fatal.
      })
    return () => {
      alive = false
    }
  }, [])

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

  // Payments is locked to the settlement-date ("cash-flow") lens.
  const [state, dispatch] = useReducer(txReducer, {
    ...initialTxState,
    view: 'payments',
    selectedDay: isoOf(new Date()),
  })
  const [drawerTxn, setDrawerTxn] = useState<TxnVM | null>(null)

  const periodData = usePeriodData(transactions, null, selectedPeriod, selectedDate, 'cash-flow')
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])

  // Upcoming schedule reads the FULL list (future payment dates fall outside the period).
  const allVm = useMemo<TxnVM[]>(() => toViewModel(transactions), [transactions])

  useEffect(() => {
    dispatch({ type: 'SET_DAY', day: isCurrentPeriod ? isoOf(new Date()) : null })
  }, [selectedDate, selectedPeriod, isCurrentPeriod])

  const expense = useMemo(() => aggregateSide(periodData.transactions, 'expense'), [periodData.transactions])
  const income = useMemo(() => aggregateSide(periodData.transactions, 'income'), [periodData.transactions])

  // Outflow-focused triad: total owed this period, what has already settled, and
  // what is still scheduled — split on settlement date vs today.
  const paymentStatus = useMemo(() => {
    const today = isoOf(new Date())
    let paid = 0
    for (const t of vm) {
      if (t.type === 'out' && t.settlementDate <= today) paid += t.amount
    }
    const upcoming = Math.max(0, periodData.expense - paid)
    return { paid, upcoming }
  }, [vm, periodData.expense])

  const days = useMemo(
    () => buildDays(periodData.startDate, periodData.endDate),
    [periodData.startDate, periodData.endDate],
  )
  const groups = useMemo(
    () => collapseCardStatements(buildLedger(vm, state), cardNames),
    [vm, state, cardNames],
  )

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

        <MotionBox variants={riseV} mb="clamp(1.15rem,2.4vw,1.55rem)">
          <PaymentsSummary
            total={periodData.expense}
            paid={paymentStatus.paid}
            upcoming={paymentStatus.upcoming}
            periodLabel={periodLabel}
          />
        </MotionBox>

        {/* Outflow chart leads the page, mirroring Behaviour */}
        <MotionBox variants={riseV} mb="clamp(1.15rem,2.4vw,1.55rem)">
          {loading ? (
            <Skeleton height="230px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <DailyChart
              days={days}
              txns={vm}
              view="payments"
              selectedDay={state.selectedDay}
              onSelectDay={selectDay}
              hlRhythm={state.hlRhythm}
              hlMomentum={state.hlMomentum}
              rhythmWeekday={null}
              monthLabel={periodLabel}
              reduce={reduce}
            />
          )}
        </MotionBox>

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          <UpcomingPayments allTxns={allVm} />
        </MotionBox>

        <MotionBox className="body-grid" variants={riseV} minW={0}>
          <ActivityPane
            state={state}
            groups={groups}
            onSetQuery={(q) => dispatch({ type: 'SET_Q', q })}
            onSetFilter={(filter) => dispatch({ type: 'SET_FILTER', filter })}
            onClearDay={() => dispatch({ type: 'SET_DAY', day: null })}
            onOpen={(txn) => (txn.statement ? onPageChange?.('cards') : setDrawerTxn(txn))}
            reduce={reduce}
          />
        </MotionBox>

        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <Distribution expense={expense} income={income} view="payments" periodLabel={periodLabel} initialSide="expense" />
        </MotionBox>

      </MotionBox>

      <TransactionDrawer txn={drawerTxn} onClose={() => setDrawerTxn(null)} />
    </Box>
  )
}

function PaymentsSummary({
  total,
  paid,
  upcoming,
  periodLabel,
}: {
  total: number
  paid: number
  upcoming: number
  periodLabel: string
}) {
  return (
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="18px" boxShadow="var(--pb-shadow)" p="clamp(1.1rem, 2.4vw, 1.5rem)">
      <VStack align="stretch" spacing={4}>
        <VStack align="stretch" spacing={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Payments - {periodLabel}
          </Text>
          <Text fontSize="sm" color="var(--pb-ink-soft)">Scheduled cash outflow</Text>
        </VStack>

        <Text fontFamily="var(--pb-serif)" fontSize="clamp(1.2rem, 2.6vw, 1.55rem)" fontWeight={400} lineHeight={1.25} color="var(--pb-ink)" maxW="48ch">
          {total > 0 ? (
            <>You have <Text as="em" color="var(--pb-coral)">{fmtCurrency(total)}</Text> scheduled to leave in {periodLabel}.</>
          ) : (
            <>No payments are scheduled in {periodLabel}.</>
          )}
        </Text>

        <Text pt={3} borderTop="1px solid var(--pb-hair)" fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.08em" textTransform="uppercase" color={upcoming > 0 ? 'var(--pb-gold-2)' : 'var(--pb-income)'}>
          {total === 0
            ? 'No payments due in this period'
            : upcoming > 0
              ? `${fmtCurrency(upcoming)} remaining · ${fmtCurrency(paid)} paid`
              : `All payments settled · ${fmtCurrency(paid)} paid`}
        </Text>
      </VStack>
    </Box>
  )
}
