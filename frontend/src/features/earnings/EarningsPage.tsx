import { Box, Flex, Grid, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

import { useDashboardData } from '../../hooks/useDashboardData'
import { getPreviousPeriodDate, usePeriodData } from '../../hooks/usePeriodData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { useI18n } from '../../i18n'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import ActivityDayModal from '../transactions/components/ActivityDayModal'
import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import ActivityIntensityStrip, { type ChartDay } from '../transactions/components/ActivityIntensityStrip'
import { toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { earningsBySource } from '../behaviour/insights'
import MerchantLogo from '../../components/ui/MerchantLogo'
import { NuSection } from '../dashboard/components/nu'
import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'

type I18nApi = ReturnType<typeof useI18n>

function periodNavigationLabel(
  date: Date,
  period: 'day' | 'week' | 'month' | 'year',
  locale: I18nApi['locale'],
  formatDate: I18nApi['formatDate'],
): string {
  if (period === 'month') {
    // Sentence case, matching the mobile app's period label.
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
  const { locale, t, formatCurrency, formatDate } = useI18n()
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

  const periodLabel = periodNavigationLabel(selectedDate, selectedPeriod, locale, formatDate)
  const difference = periodData.income - previousPeriodData.income
  const comparisonCopy = previousPeriodData.income === 0
    ? t('earnings.comparison.none')
    : difference === 0
      ? t('earnings.comparison.same', { amount: formatCurrency(previousPeriodData.income) })
      : t(
          difference > 0 ? 'earnings.comparison.more' : 'earnings.comparison.less',
          { amount: formatCurrency(Math.abs(difference)) },
        )

  const change = periodData.income - previousPeriodData.income

  return (
    <Box>
      {/* Purple page header — continues the app bar, like the mobile Incomes tab. */}
      <NuHero
        title={t('earnings.hero.title')}
        action={<NuHeroBadge><TrendingUp size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>}
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
                    {formatCurrency(periodData.income)}
                  </Text>
                  <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.82)">
                    {t(incomeTransactions.length === 1 ? 'earnings.hero.count.one' : 'earnings.hero.count.other', { count: incomeTransactions.length })}
                    {' · '}
                    <Text as="span" fontWeight={600} color={previousPeriodData.income === 0 || change === 0 ? 'rgba(255,255,255,0.9)' : change > 0 ? '#9ff0c8' : '#ffc2b8'}>
                      {comparisonCopy}
                    </Text>
                  </Text>
                </>
              )}
            </Box>
            <Box flexShrink={0} minW={{ md: '360px' }}>
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
          <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            {loading ? (
              <Skeleton height="230px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
            ) : (
              <ActivityIntensityStrip
                appearance="nu"
                days={days}
                txns={incomeTransactions}
                selectedDay={selectedDay}
                onSelectDay={(day) => setSelectedDay((current) => current === day ? null : day)}
                periodLabel={periodLabel}
                tone="income"
                dateKey="purchaseDate"
                title={t('earnings.activity.title')}
                caption={t('earnings.activity.caption')}
              />
            )}
          </MotionBox>

          <MotionBox variants={riseV}>
            {loading ? (
              <Box px={{ base: 4, md: 6 }} pb={6}>
                <Skeleton height="260px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
              </Box>
            ) : (
              <EarningsSources sources={sources} periodLabel={periodLabel} />
            )}
          </MotionBox>
        </MotionBox>
      </Box>

      {selectedDay && (
        <SelectedDayIncomes
          day={selectedDay}
          incomes={selectedDayIncomes}
          onClose={() => setSelectedDay(null)}
        />
      )}
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
  const { t, formatCurrency, formatDate } = useI18n()
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)
  const dayLabel = formatDate(day, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <ActivityDayModal
      isOpen
      onClose={onClose}
      label={t('earnings.day.label', { date: dayLabel })}
      tone="income"
      title={dayLabel}
      totalLabel={t('earnings.day.total')}
      total={formatCurrency(total)}
      count={incomes.length}
      dateContext={t('earnings.day.dateContext')}
    >
      <VStack align="stretch" spacing={2}>
        {incomes.length === 0 ? (
          <Box border="1px dashed var(--pb-hair-2)" borderRadius="14px" p={4} bg="var(--pb-surface-2)">
            <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-soft)">
              {t('earnings.day.empty')}
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

/** Income sources as a flat list on the white sheet (logo · name · share · amount). */
function EarningsSources({
  sources,
  periodLabel,
}: {
  sources: ReturnType<typeof earningsBySource>
  periodLabel: string
}) {
  const { t, formatCurrency, formatNumber } = useI18n()
  const total = sources.reduce((sum, source) => sum + source.total, 0)

  return (
    <NuSection
      title={t('earnings.sources.title')}
      subtitle={t('earnings.sources.description', { period: periodLabel })}
      action={sources.length > 0 ? (
        <Text
          flexShrink={0} px={3} py={1} borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)"
          fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(total)}
        </Text>
      ) : undefined}
    >
      {sources.length === 0 ? (
        <Box bg="var(--nu-surface)" borderRadius="16px" p={6} textAlign="center">
          <Text fontSize="sm" color="var(--pb-ink-soft)">{t('earnings.sources.empty')}</Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} columnGap={10}>
          {sources.map((source) => {
            const percentage = total > 0 ? Math.round((source.total / total) * 100) : 0
            const paymentLabel = t(
              source.count === 1 ? 'earnings.source.payment.one' : 'earnings.source.payment.other',
              { count: formatNumber(source.count) },
            )
            return (
              <HStack key={source.name} spacing={3} py={3} borderBottom="1px solid var(--pb-hair)" minW={0}>
                <MerchantLogo name={source.name} domain={source.merchantDomain} size={42} borderRadius="50%" />
                <Box minW={0} flex={1}>
                  <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{source.name}</Text>
                  <Text mt={0.5} fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
                    {t('earnings.source.share', { payments: paymentLabel, percentage: formatNumber(percentage) })}
                  </Text>
                </Box>
                <Text flexShrink={0} fontSize="md" fontWeight={700} color="var(--nu-positive)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  +{formatCurrency(source.total)}
                </Text>
              </HStack>
            )
          })}
        </Grid>
      )}
    </NuSection>
  )
}
