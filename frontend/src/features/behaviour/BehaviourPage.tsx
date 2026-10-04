import { useEffect, useMemo, useState } from 'react'
import { Box, Flex, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { TrendingDown } from 'lucide-react'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData, getPreviousPeriodDate } from '../../hooks/usePeriodData'
import { useI18n } from '../../i18n'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import TopMerchants from '../dashboard/components/TopMerchants'
import { NuSection } from '../dashboard/components/nu'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'

import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import ActivityIntensityStrip, { type ChartDay } from '../transactions/components/ActivityIntensityStrip'
import { toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'

import { aggregateSide } from '../categories/data/aggregate'
import Distribution from '../categories/components/Distribution'

import InsightsPanel from './components/InsightsPanel'
import { deriveSmartInsights } from './smartInsights'

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
    // Sentence case, matching the Earnings page and the mobile app.
    const label = formatDate(date, { month: 'long', year: 'numeric' })
    return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1)
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
  const { locale, t, formatDate, formatCurrency } = useI18n()
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
  // Full expense history — the pattern insights compare like-for-like with
  // earlier periods and need category history for outliers.
  const allExpenseVm = useMemo<TxnVM[]>(
    () => toViewModel(spendingTransactions).filter((transaction) => transaction.type === 'out'),
    [spendingTransactions],
  )

  useEffect(() => {
    setSelectedChartDay(null)
  }, [selectedDate, selectedPeriod])

  const smartInsights = useMemo(
    () => deriveSmartInsights({
      allExpenses: allExpenseVm,
      period: selectedPeriod,
      start: periodData.startDate,
      end: periodData.endDate,
    }),
    [allExpenseVm, selectedPeriod, periodData.startDate, periodData.endDate],
  )

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

  const change = periodData.expense - prevPeriodData.expense
  const comparisonCopy = prevPeriodData.expense === 0
    ? t('behaviour.comparison.none')
    : change === 0
      ? t('earnings.comparison.same', { amount: formatCurrency(prevPeriodData.expense) })
      : t(change > 0 ? 'earnings.comparison.more' : 'earnings.comparison.less', { amount: formatCurrency(Math.abs(change)) })

  return (
    <Box>
      {/* Purple page header — continues the app bar, same pattern as Earnings. */}
      <NuHero
        title={t('nav.behaviour.label')}
        action={<NuHeroBadge><TrendingDown size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
      >

          <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 8 }}>
            <Box minW={0}>
              <Text fontSize="sm" color="rgba(255,255,255,0.82)">{t('earnings.hero.total')}</Text>
              {loading ? (
                <Skeleton mt={1} height="44px" maxW="240px" borderRadius="10px" startColor="rgba(255,255,255,0.18)" endColor="rgba(255,255,255,0.3)" />
              ) : (
                <>
                  <Text fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1} color="white" noOfLines={1}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(periodData.expense)}
                  </Text>
                  <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.82)">
                    {t(vm.length === 1 ? 'behaviour.hero.count.one' : 'behaviour.hero.count.other', { count: vm.length })}
                    {' · '}
                    {/* Spending less than before is the good direction. */}
                    <Text as="span" fontWeight={600} color={prevPeriodData.expense === 0 || change === 0 ? 'rgba(255,255,255,0.9)' : change < 0 ? '#9ff0c8' : '#ffc2b8'}>
                      {comparisonCopy}
                    </Text>
                  </Text>
                  <Text mt={1} fontSize="xs" color="rgba(255,255,255,0.7)">{t('behaviour.summary.installmentsNote')}</Text>
                </>
              )}
            </Box>
            <Box flexShrink={0} minW={{ md: '400px' }}>
              <PeriodNavBar
                embedded
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
                dateKey="purchaseDate"
                title={t('behaviour.activity.title')}
                caption={t('behaviour.activity.caption')}
              />
            )}
          </MotionBox>

          <MotionBox variants={riseV}>
            {selectedChartDay ? (
              <SelectedDayExpenses
                day={selectedChartDay}
                expenses={selectedDayExpenses}
                onClose={() => setSelectedChartDay(null)}
              />
            ) : (
              <NuSection
                title={t('behaviour.sections.categories')}
                subtitle={t('behaviour.sections.categoriesCaption', { period: narrativePeriodLabel })}
              >
                <Distribution
                  expense={expense}
                  previousExpense={previousExpense}
                  periodLabel={periodLabel}
                />
              </NuSection>
            )}
          </MotionBox>

          <MotionBox variants={riseV}>
            <NuSection title={t('behaviour.sections.merchants')} subtitle={t('behaviour.sections.merchantsCaption')}>
              {loading ? (
                <Skeleton height="260px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
              ) : (
                <TopMerchants transactions={periodData.transactions} />
              )}
            </NuSection>
          </MotionBox>

          {/* Only rendered when at least one insight has enough data to be fair. */}
          {!loading && smartInsights.length > 0 && (
            <MotionBox variants={riseV}>
              <NuSection title={t('behaviour.sections.insights')} subtitle={t('behaviour.sections.insightsCaption')}>
                <InsightsPanel insights={smartInsights} period={selectedPeriod} />
              </NuSection>
            </MotionBox>
          )}
        </MotionBox>
      </Box>
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
    <NuSection
      title={dayLabel}
      subtitle={`${t('behaviour.day.total')} · ${formatCurrency(total)}`}
      action={(
        <Box
          as="button"
          type="button"
          onClick={onClose}
          flexShrink={0}
          px={3}
          py={1.5}
          borderRadius="full"
          bg="var(--nu-brand-tint)"
          color="var(--nu-brand)"
          fontSize="xs"
          fontWeight={700}
          _hover={{ bg: 'rgba(130, 10, 209, 0.14)' }}
          _focusVisible={{ outline: '2px solid var(--nu-brand)', outlineOffset: '2px' }}
        >
          {t('behaviour.day.viewAll')}
        </Box>
      )}
    >
      {expenses.length === 0 ? (
        <Box py={4}>
          <Text color="var(--pb-ink-soft)" fontSize="sm">
            {t('behaviour.day.empty')}
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={0}>
          {expenses.map((expense) => (
            <ActivityDayTransactionRow
              key={expense.id}
              appearance="nu"
              transaction={expense}
              tone="expense"
            />
          ))}
        </VStack>
      )}
    </NuSection>
  )
}
