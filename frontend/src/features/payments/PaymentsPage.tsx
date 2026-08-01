import { useEffect, useMemo, useState } from 'react'
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
import ActivityDayModal from '../transactions/components/ActivityDayModal'
import { collapseCardStatements, toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { listPaymentMethods } from '../../api'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

import UpcomingPayments from './components/UpcomingPayments'

interface PaymentsPageProps {
  onOpenCardStatement?: (target: { cardId: number; paymentDate: string }) => void
}

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

export default function PaymentsPage({ onOpenCardStatement }: PaymentsPageProps) {
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

  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null)

  const periodData = usePeriodData(transactions, null, selectedPeriod, selectedDate, 'cash-flow')
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])

  // Upcoming schedule reads the FULL list (future payment dates fall outside the period).
  const allVm = useMemo<TxnVM[]>(() => toViewModel(transactions), [transactions])

  useEffect(() => {
    setSelectedChartDay(null)
  }, [selectedDate, selectedPeriod])

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
  const selectedDayPayments = useMemo(() => {
    if (!selectedChartDay) return []

    const rows = vm.filter(
      (transaction) => transaction.type === 'out' && transaction.settlementDate === selectedChartDay,
    )
    const total = rows.reduce((sum, transaction) => sum + transaction.amount, 0)
    return collapseCardStatements(
      [{ key: selectedChartDay, date: new Date(`${selectedChartDay}T00:00:00`), rows, inTotal: 0, outTotal: total }],
      cardNames,
    )[0]?.rows ?? []
  }, [cardNames, selectedChartDay, vm])

  const periodLabel = formatLabel()

  const selectDay = (iso: string) => {
    setSelectedChartDay((current) => current === iso ? null : iso)
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
              selectedDay={selectedChartDay}
              onSelectDay={selectDay}
              hlRhythm={false}
              hlMomentum={false}
              rhythmWeekday={null}
              monthLabel={periodLabel}
              reduce={reduce}
            />
          )}
        </MotionBox>

        {selectedChartDay && (
          <SelectedDayPayments
            day={selectedChartDay}
            payments={selectedDayPayments}
            onClose={() => setSelectedChartDay(null)}
            onOpenCardStatement={onOpenCardStatement}
          />
        )}

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          <UpcomingPayments allTxns={allVm} />
        </MotionBox>

        <MotionBox variants={riseV} mt="clamp(1.6rem,3vw,2.4rem)">
          <Distribution expense={expense} income={income} view="payments" periodLabel={periodLabel} initialSide="expense" />
        </MotionBox>

      </MotionBox>

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

function SelectedDayPayments({
  day,
  payments,
  onClose,
  onOpenCardStatement,
}: {
  day: string
  payments: TxnVM[]
  onClose: () => void
  onOpenCardStatement?: (target: { cardId: number; paymentDate: string }) => void
}) {
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const dayLabel = new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <ActivityDayModal
      isOpen
      onClose={onClose}
      label={`Payments on ${dayLabel}`}
      tone="expense"
      title={dayLabel}
      totalLabel="Paid"
      total={fmtCurrency(total)}
      count={payments.length}
      dateContext="Settlement date"
    >
      <VStack align="stretch" spacing={2}>
        {payments.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)">
            No payments recorded on this day.
          </Text>
        ) : (
          <VStack align="stretch" spacing={1.5}>
            {payments.map((payment) => payment.statement ? (
              <StatementPaymentRow
                key={payment.id}
                payment={payment}
                onOpen={() => {
                  onClose()
                  onOpenCardStatement?.({
                    cardId: payment.statement!.cardId,
                    paymentDate: payment.settlementDate,
                  })
                }}
              />
            ) : (
              <Box key={payment.id} display="flex" justifyContent="space-between" alignItems="baseline" gap={4} py="0.7rem" borderTop="1px solid var(--pb-hair)">
                <Text fontFamily="var(--pb-serif)" color="var(--pb-ink)" noOfLines={1}>
                  {payment.merchant}
                </Text>
                <Text fontFamily="var(--pb-mono)" fontSize=".95rem" color="var(--pb-coral)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fmtCurrency(payment.amount)}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </ActivityDayModal>
  )
}

function StatementPaymentRow({ payment, onOpen }: { payment: TxnVM; onOpen: () => void }) {
  const statementMonth = new Date(`${payment.settlementDate}T00:00:00`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Box
      as="button"
      type="button"
      onClick={onOpen}
      display="flex"
      w="full"
      justifyContent="space-between"
      alignItems="baseline"
      gap={4}
      py="0.7rem"
      borderTop="1px solid var(--pb-hair)"
      textAlign="left"
      cursor="pointer"
      borderRadius="10px"
      px={2}
      mx={-2}
      _hover={{ bg: 'var(--pb-surface-2)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
    >
      <Box minW={0}>
        <Text fontFamily="var(--pb-serif)" color="var(--pb-ink)" noOfLines={1}>
          {payment.merchant} statement
        </Text>
        <Text mt={0.5} fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" noOfLines={1}>
          {statementMonth} statement · View card statement
        </Text>
      </Box>
      <Text fontFamily="var(--pb-mono)" fontSize=".95rem" color="var(--pb-coral)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtCurrency(payment.amount)}
      </Text>
    </Box>
  )
}
