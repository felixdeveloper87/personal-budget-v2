import { useMemo, useState } from 'react'
import { Box, Grid, Skeleton, VStack } from '@chakra-ui/react'

import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodData } from '../../hooks/usePeriodData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'

import { PageHeader } from '../../components/ui'
import { Layers } from '../../components/ui/icons'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PaperFooter from '../dashboard/components/PaperFooter'

import ViewBar from './components/ViewBar'
import PeriodRangeBar from './components/PeriodRangeBar'
import SummaryStrip from './components/SummaryStrip'
import Distribution from './components/Distribution'

import { aggregateSide } from './data/aggregate'
import { computeSide } from './data/computeSide'
import { gbp } from './data/format'
import type { Side, ViewMode } from './data/types'

interface CategoriesPageProps {
  /** Tab to open on first render — used when navigating from the home cards. */
  initialTab?: 'expenses' | 'incomes'
}

export default function CategoriesPage({ initialTab = 'expenses' }: CategoriesPageProps) {
  const [view, setView] = useState<ViewMode>('behaviour')
  const initialSide: Side = initialTab === 'incomes' ? 'income' : 'expense'

  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator(initialTab)

  const { transactions, loading } = useDashboardData(selectedDate, selectedPeriod)

  // Period bounds, anchored on the Behaviour (purchase) clock.
  const { startDate, endDate } = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    selectedDate,
    'activity',
  )

  const expense = useMemo(
    () => aggregateSide(transactions, startDate, endDate, 'expense'),
    [transactions, startDate, endDate],
  )
  const income = useMemo(
    () => aggregateSide(transactions, startDate, endDate, 'income'),
    [transactions, startDate, endDate],
  )

  // Summary recomputes on view only — always shows both sides at once.
  const summaryCards = useMemo(() => {
    const e = computeSide(expense, view)
    const i = computeSide(income, view)
    return [
      { label: 'Expense categories', value: String(e.rows.length), side: 'expense' as Side },
      { label: 'Total expenses', value: gbp(e.total, 2), side: 'expense' as Side },
      { label: 'Income categories', value: String(i.rows.length), side: 'income' as Side },
      { label: 'Total income', value: gbp(i.total, 2), side: 'income' as Side },
    ]
  }, [expense, income, view])

  const now = new Date()
  const isCurrent =
    selectedPeriod === 'month' &&
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth()

  const periodLabel = formatLabel()

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <MotionBox variants={riseV}>
            <PageHeader
              icon={Layers}
              title="Categories"
              subtitle="See where every pound goes, broken down by category."
            />
          </MotionBox>

          <MotionBox variants={riseV}>
            <ViewBar view={view} onChange={setView} />
          </MotionBox>

          <MotionBox variants={riseV}>
            <PeriodRangeBar
              selectedPeriod={selectedPeriod}
              label={periodLabel}
              isCurrent={isCurrent}
              onPeriodChange={onPeriodChange}
              onNavigate={navigatePeriod}
              onGoToToday={goToToday}
            />
          </MotionBox>

          {loading ? (
            <>
              <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap="0.7rem">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="78px" borderRadius="14px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
                ))}
              </Grid>
              <Skeleton height="420px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
            </>
          ) : (
            <>
              <MotionBox variants={riseV}>
                <SummaryStrip viewKey={view} cards={summaryCards} />
              </MotionBox>

              <MotionBox variants={riseV}>
                <Distribution
                  expense={expense}
                  income={income}
                  view={view}
                  periodLabel={periodLabel}
                  initialSide={initialSide}
                />
              </MotionBox>
            </>
          )}

          <MotionBox variants={riseV}>
            <PaperFooter />
          </MotionBox>
        </VStack>
      </MotionBox>
    </Box>
  )
}
