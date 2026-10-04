import { useEffect, useMemo, useState } from 'react'
import { Box, Flex, Skeleton, Text, VStack } from '@chakra-ui/react'
import { CalendarClock, CreditCard } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { getPreviousPeriodDate, usePeriodData } from '../../hooks/usePeriodData'
import { useI18n } from '../../i18n'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import { NuSection } from '../dashboard/components/nu'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import UpcomingPayments, { useUpcomingBuckets } from './components/UpcomingPayments'

import ActivityDayModal from '../transactions/components/ActivityDayModal'
import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import ActivityIntensityStrip, { type ChartDay } from '../transactions/components/ActivityIntensityStrip'
import { collapseCardStatements, toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { listPaymentMethods } from '../../api'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

interface PaymentsPageProps {
  onOpenCardStatement?: (target: { cardId: number; paymentDate: string }) => void
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
  const { locale, t, formatDate, formatCurrency } = useI18n()
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
    isCurrentPeriod,
  } = usePeriodNavigator()

  const { transactions, loading } = useDashboardData(selectedDate, selectedPeriod)

  const [selectedChartDay, setSelectedChartDay] = useState<string | null>(null)

  const periodData = usePeriodData(transactions, null, selectedPeriod, selectedDate, 'cash-flow')
  const previousDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const previousPeriodData = usePeriodData(transactions, null, selectedPeriod, previousDate, 'cash-flow')
  const vm = useMemo<TxnVM[]>(() => toViewModel(periodData.transactions), [periodData.transactions])
  // Full history — "what leaves next" looks past the selected period.
  const allVm = useMemo<TxnVM[]>(() => toViewModel(transactions), [transactions])
  const upcoming = useUpcomingBuckets(allVm)

  useEffect(() => {
    setSelectedChartDay(null)
  }, [selectedDate, selectedPeriod])

  const expense = useMemo(() => aggregateSide(periodData.transactions, 'expense'), [periodData.transactions])
  const previousExpense = useMemo(
    () => aggregateSide(previousPeriodData.transactions, 'expense'),
    [previousPeriodData.transactions],
  )

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

  const periodLabel = periodNavigationLabel(selectedDate, selectedPeriod, locale, formatDate)

  const selectDay = (iso: string) => {
    setSelectedChartDay((current) => current === iso ? null : iso)
  }

  const paidShare = periodData.expense > 0 ? Math.min(100, (paymentStatus.paid / periodData.expense) * 100) : 0

  return (
    <Box>
      {/* Purple page header — same pattern as Expenses and Earnings. */}
      <NuHero
        title={t('nav.payments.label')}
        action={<NuHeroBadge><CalendarClock size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
      >
        <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 8 }}>
          <Box minW={0} flex={1} maxW={{ md: '440px' }}>
            <Text fontSize="sm" color="rgba(255,255,255,0.82)">{t('payments.summary.subtitle')}</Text>
            {loading ? (
              <Skeleton mt={1} height="44px" maxW="240px" borderRadius="10px" startColor="rgba(255,255,255,0.18)" endColor="rgba(255,255,255,0.3)" />
            ) : (
              <>
                <Text fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} color="white" noOfLines={1}
                  sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(periodData.expense)}
                </Text>
                {periodData.expense > 0 ? (
                  <>
                    {/* Paid vs still to pay — one bar, white on translucent. */}
                    <Box
                      mt={3}
                      h="6px"
                      borderRadius="full"
                      bg="rgba(255,255,255,0.22)"
                      overflow="hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(paidShare)}
                      aria-label={t('payments.hero.paidAria', { percentage: Math.round(paidShare) })}
                    >
                      <Box h="full" w={`${paidShare}%`} borderRadius="full" bg="white" transition="width 300ms ease" />
                    </Box>
                    <Flex mt={2} justify="space-between" gap={3} fontSize="sm">
                      <Text color="white" fontWeight={600}>{t('payments.hero.paid', { amount: formatCurrency(paymentStatus.paid) })}</Text>
                      <Text color="rgba(255,255,255,0.82)">
                        {paymentStatus.upcoming > 0
                          ? t('payments.hero.toPay', { amount: formatCurrency(paymentStatus.upcoming) })
                          : t('payments.hero.allPaid')}
                      </Text>
                    </Flex>
                  </>
                ) : (
                  <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.82)">{t('payments.summary.noneDue')}</Text>
                )}
              </>
            )}
          </Box>
          <Box flexShrink={0} minW={{ md: '400px' }}>
            <PeriodNavBar
              embedded
              allowedPeriods={['week', 'month']}
              selectedPeriod={selectedPeriod}
              label={periodLabel}
              isCurrent={isCurrentPeriod}
              onPeriodChange={onPeriodChange}
              onNavigate={navigatePeriod}
              onGoToToday={goToToday}
            />
          </Box>
        </Flex>
      </NuHero>

      {/* White sheet with rounded top tucked over the purple header. */}
      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <MotionBox
          className="nu-dashboard"
          variants={containerV}
          initial={reduce ? false : 'hidden'}
          animate="show"
          bg="var(--nu-page)"
          borderTopRadius="24px"
          borderBottomRadius={{ base: 0, md: '24px' }}
          overflow="hidden"
          boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
        >
          {/* Payment activity follows settlement date. */}
          <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            {loading ? (
              <Skeleton height="230px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
            ) : (
              <ActivityIntensityStrip
                appearance="nu"
                days={days}
                txns={vm}
                selectedDay={selectedChartDay}
                onSelectDay={selectDay}
                periodLabel={periodLabel}
                tone="expense"
                dateKey="settlementDate"
                title={t('payments.activity.title')}
                caption={t('payments.activity.caption')}
              />
            )}
          </MotionBox>

          <MotionBox variants={riseV}>
            <NuSection
              title={t('payments.upcoming.title')}
              subtitle={t('payments.upcoming.caption')}
              action={upcoming.grandTotal > 0 ? (
                <Text fontSize="md" fontWeight={700} color="var(--pb-ink)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(upcoming.grandTotal)}
                </Text>
              ) : undefined}
            >
              {loading ? (
                <Skeleton height="96px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
              ) : (
                <UpcomingPayments allTxns={allVm} />
              )}
            </NuSection>
          </MotionBox>

          <MotionBox variants={riseV}>
            <NuSection
              title={t('behaviour.sections.categories')}
              subtitle={t('payments.sections.categoriesCaption', { period: periodLabel })}
            >
              <Distribution
                appearance="nu"
                expense={expense}
                previousExpense={previousExpense}
                periodLabel={periodLabel}
              />
            </NuSection>
          </MotionBox>
        </MotionBox>
      </Box>

      {selectedChartDay && (
        <SelectedDayPayments
          day={selectedChartDay}
          payments={selectedDayPayments}
          onClose={() => setSelectedChartDay(null)}
          onOpenCardStatement={onOpenCardStatement}
        />
      )}
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
  const { t, formatCurrency, formatDate } = useI18n()
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const dayLabel = formatDate(day, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <ActivityDayModal
      isOpen
      onClose={onClose}
      label={t('payments.day.label', { date: dayLabel })}
      tone="expense"
      title={dayLabel}
      totalLabel={t('payments.day.total')}
      total={formatCurrency(total)}
      count={payments.length}
      dateContext={t('payments.day.dateContext')}
    >
      <VStack align="stretch" spacing={2}>
        {payments.length === 0 ? (
          <Box borderRadius="14px" p={4} bg="var(--pb-surface-2)">
            <Text fontSize="sm" color="var(--pb-ink-soft)">
              {t('payments.day.empty')}
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={2}>
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
              <ActivityDayTransactionRow key={payment.id} transaction={payment} tone="expense" />
            ))}
          </VStack>
        )}
      </VStack>
    </ActivityDayModal>
  )
}

function StatementPaymentRow({ payment, onOpen }: { payment: TxnVM; onOpen: () => void }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const statementMonth = formatDate(payment.settlementDate, {
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
      alignItems="center"
      gap={3}
      p={3}
      textAlign="left"
      cursor="pointer"
      borderRadius="14px"
      bg="var(--pb-surface-2)"
      transition="background .15s ease"
      _hover={{ bg: 'var(--nu-brand-tint, #f3e8fc)' }}
      _focusVisible={{ boxShadow: '0 0 0 2px var(--nu-brand, #820ad1)', outline: 'none' }}
    >
      <Flex align="center" gap={3} minW={0}>
        <Flex w="40px" h="40px" flexShrink={0} align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint, #f3e8fc)" color="var(--nu-brand, #820ad1)">
          <CreditCard size={18} strokeWidth={2.2} aria-hidden="true" />
        </Flex>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
            {t('payments.statement.title', { merchant: payment.merchant })}
          </Text>
          <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
            {t('payments.statement.description', { month: statementMonth })}
          </Text>
        </Box>
      </Flex>
      <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
        −{formatCurrency(payment.amount)}
      </Text>
    </Box>
  )
}
