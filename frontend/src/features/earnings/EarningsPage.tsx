import { Box, Flex, Grid, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { getPreviousPeriodDate, usePeriodData } from '../../hooks/usePeriodData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import { fmtCurrency } from '../dashboard/components/format'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import ActivityDayModal from '../transactions/components/ActivityDayModal'
import ActivityDayTransactionRow from '../transactions/components/ActivityDayTransactionRow'
import ActivityIntensityStrip, { type ChartDay } from '../transactions/components/ActivityIntensityStrip'
import { toViewModel } from '../transactions/transactions.utils'
import type { TxnVM } from '../transactions/transactions.types'
import { earningsBySource } from '../behaviour/insights'
import MerchantLogo from '../../components/ui/MerchantLogo'

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

        <MotionBox variants={riseV} mb="clamp(1.4rem,3vw,2rem)">
          {loading ? (
            <Skeleton height="230px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <ActivityIntensityStrip
              days={days}
              txns={incomeTransactions}
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay((current) => current === day ? null : day)}
              periodLabel={periodLabel}
              tone="income"
              dateKey="purchaseDate"
              title="Income activity"
              caption="Daily income intensity"
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
  const total = sources.reduce((sum, source) => sum + source.total, 0)

  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="var(--pb-shadow)"
      p="clamp(1.1rem,2.5vw,1.5rem)"
      overflow="hidden"
    >
      <VStack align="stretch" spacing={5}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', sm: 'flex-end' }}
          gap={3}
          pb={4}
          borderBottom="1px solid var(--pb-hair)"
        >
          <Box>
            <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
              Earnings by source
            </Text>
            <Text mt={1} fontSize="sm" color="var(--pb-ink-soft)">
              Where your income came from in {periodLabel}.
            </Text>
          </Box>

          {sources.length > 0 && (
            <VStack align={{ base: 'flex-start', sm: 'flex-end' }} spacing={0.5}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {sources.length} {sources.length === 1 ? 'source' : 'sources'} · total received
              </Text>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="1.65rem"
                fontWeight={500}
                lineHeight={1}
                color="var(--pb-income)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmtCurrency(total)}
              </Text>
            </VStack>
          )}
        </Flex>

        {sources.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)" py={3}>
            No earnings recorded in this period.
          </Text>
        ) : (
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} gap={3}>
            {sources.map((source, index) => (
              <EarningsSourceCard
                key={source.name}
                source={source}
                rank={index + 1}
                share={total > 0 ? source.total / total : 0}
              />
            ))}
          </Grid>
        )}
      </VStack>
    </Box>
  )
}

function EarningsSourceCard({
  source,
  rank,
  share,
}: {
  source: ReturnType<typeof earningsBySource>[number]
  rank: number
  share: number
}) {
  const percentage = Math.round(share * 100)
  const paymentLabel = `${source.count} ${source.count === 1 ? 'payment' : 'payments'}`

  return (
    <Box
      bg="var(--pb-surface-2)"
      border="1px solid var(--pb-hair)"
      borderRadius="16px"
      px={{ base: 3.5, sm: 4 }}
      py={{ base: 3.5, sm: 4 }}
      transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
      _hover={{
        transform: 'translateY(-2px)',
        borderColor: 'var(--pb-hair-2)',
        boxShadow: '0 10px 28px rgba(23, 53, 38, 0.08)',
      }}
    >
      <HStack align="center" spacing={3.5}>
        <Box position="relative" w="46px" h="46px" flexShrink={0}>
          <MerchantLogo name={source.name} size={46} borderRadius="13px" />
          <Box
            position="absolute"
            right="-5px"
            bottom="-5px"
            minW="19px"
            h="19px"
            px="4px"
            display="grid"
            placeItems="center"
            borderRadius="full"
            bg="var(--pb-surface)"
            border="1px solid var(--pb-hair-2)"
            boxShadow="0 2px 6px rgba(0,0,0,0.12)"
          >
            <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} lineHeight={1} color="var(--pb-ink-faint)">
              {rank}
            </Text>
          </Box>
        </Box>

        <Box minW={0} flex={1}>
          <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} lineHeight={1.2} color="var(--pb-ink)" noOfLines={1}>
            {source.name}
          </Text>
          <Text mt={1} fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)">
            {paymentLabel} · {percentage}% of earnings
          </Text>
        </Box>

        <VStack align="flex-end" spacing={0.5} flexShrink={0}>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize={{ base: 'lg', sm: 'xl' }}
            fontWeight={600}
            lineHeight={1}
            color="var(--pb-income)"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {fmtCurrency(source.total)}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)">
            received
          </Text>
        </VStack>
      </HStack>

      <Box
        role="progressbar"
        aria-label={`${source.name}: ${percentage}% of recorded earnings`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        mt={3.5}
        h="4px"
        borderRadius="full"
        bg="var(--pb-surface-3)"
        overflow="hidden"
      >
        <Box
          h="full"
          w={`max(${percentage}%, 8px)`}
          borderRadius="full"
          bgGradient="linear(to-r, var(--pb-income), var(--pb-forest-2))"
          opacity={0.82}
          transition="width 0.5s ease"
        />
      </Box>
    </Box>
  )
}
