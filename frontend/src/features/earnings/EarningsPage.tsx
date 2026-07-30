import { Box, Grid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

import { useDashboardData } from '../../hooks/useDashboardData'
import { getPreviousPeriodDate, usePeriodData } from '../../hooks/usePeriodData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import { fmtCurrency } from '../dashboard/components/format'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import { toViewModel } from '../transactions/transactions.utils'
import { earningsBySource } from '../behaviour/insights'

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

        <MotionBox variants={riseV}>
          {loading ? (
            <Skeleton height="300px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
          ) : (
            <EarningsSources sources={sources} periodLabel={periodLabel} />
          )}
        </MotionBox>
      </MotionBox>
    </Box>
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
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="22px" boxShadow="var(--pb-shadow)" p="clamp(1.25rem,3vw,2rem)">
      <VStack align="stretch" spacing={4}>
        <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
          Earnings - {periodLabel}
        </Text>
        <Text fontFamily="var(--pb-serif)" fontSize={{ base: '2.25rem', md: '3.4rem' }} fontWeight={400} lineHeight={1} color="var(--pb-income)" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtCurrency(total)}
        </Text>
        <Text fontSize="sm" color="var(--pb-ink-soft)">
          {comparisonCopy}
        </Text>
        <Text pt={3} borderTop="1px solid var(--pb-hair)" fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.1em" textTransform="uppercase" color={changeColor}>
          {change === 0 ? 'No change' : `${change > 0 ? '+' : '-'}${fmtCurrency(Math.abs(change))} vs previous period`}
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
  return (
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="22px" boxShadow="var(--pb-shadow)" p="clamp(1.1rem,2.5vw,1.5rem)">
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Earnings by source
          </Text>
          <Text mt={1} fontSize="sm" color="var(--pb-ink-soft)">
            Grouped by transaction description in {periodLabel}.
          </Text>
        </Box>

        {sources.length === 0 ? (
          <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)" py={3}>
            No earnings recorded in this period.
          </Text>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap="0.7rem">
            {sources.map((source) => (
              <Box key={source.name} bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" borderRadius="14px" p="1rem">
                <VStack align="stretch" spacing={2}>
                  <Text fontFamily="var(--pb-serif)" fontSize="lg" color="var(--pb-ink)" noOfLines={1}>
                    <Text as="span" color="var(--pb-ink-faint)">from </Text>{source.name}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.1em" color="var(--pb-ink-faint)">
                    x{source.count}
                  </Text>
                  <Text fontFamily="var(--pb-serif)" fontSize="1.45rem" fontWeight={500} color="var(--pb-income)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmtCurrency(source.total)}
                  </Text>
                </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>
    </Box>
  )
}
