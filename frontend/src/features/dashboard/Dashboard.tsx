import { useCallback, useEffect, useState } from 'react'
import { Box, Grid, Skeleton, useDisclosure } from '@chakra-ui/react'
import { AddTransactionModal } from '../../components/transactions'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData } from '../../hooks/usePeriodData'
import { useAuth } from '../../contexts/AuthContext'
import {
  getMonthlySummary,
  listInstallmentPlans,
  listPaymentMethods,
} from '../../api'
import type { InstallmentPlan, MonthlySummary } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { type TransactionDateBasis } from '../../utils/transactionDates'
import './theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from './components/motion'
import { NuSection, NU_SHEET_PB, NU_SHEET_WRAP } from './components/nu'
import MonthHero, { NetHero } from './components/MonthHero'
import CashPace from './components/SpendingPace'
import CategorySpendingPaces from './components/CategorySpendingPaces'
import DescriptionSpendingPaces from './components/DescriptionSpendingPaces'
import TopMerchants from './components/TopMerchants'
import UpcomingPayments from './components/UpcomingPayments'
import RecentActivity from './components/RecentActivity'
import InstallmentCarousel from './components/InstallmentCarousel'
import { useI18n } from '../../i18n'

export interface DashboardProps {
  onPageChange?: (page: AppPage) => void
}

export default function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth()
  const { t } = useI18n()

  // Dashboard is a snapshot of the current month — period browsing lives on the
  // Behaviour / Payments / Reports pages, so there's no navigator here.
  const { selectedDate, selectedPeriod } = usePeriodNavigator()

  const { transactions, monthSummary, loading, loadData } = useDashboardData(
    selectedDate,
    selectedPeriod,
  )

  // Dashboard is anchored to the Payments (cash-flow) lens — the Behaviour lens has
  // its own page now.
  const dateBasis: TransactionDateBasis = 'cash-flow'
  const periodData = usePeriodData(
    transactions,
    monthSummary,
    selectedPeriod,
    selectedDate,
    dateBasis,
  )

  // Recent activity mirrors the Behaviour lens (by purchase date) instead of the
  // cash-flow lens the rest of the dashboard is anchored to.
  const behaviourPeriodData = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    selectedDate,
    'activity',
  )

  // Previous period on the Behaviour lens, so merchant comparisons ("last month
  // you spent £X at Lidl") reflect when purchases actually happened.
  /* ── Side data: installments and credit-card names ── */
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [previousSummary, setPreviousSummary] = useState<MonthlySummary | null>(null)
  const [summaryRefresh, setSummaryRefresh] = useState(0)
  // Credit-card id → name, used to fold a card's charges into one fatura row.
  const [cardNames, setCardNames] = useState<Map<number, string>>(() => new Map())

  useEffect(() => {
    if (!user?.token) return
    void listInstallmentPlans().then(setInstallmentPlans).catch(() => {})
    void listPaymentMethods()
      .then((methods) => {
        const map = new Map<number, string>()
        for (const m of methods) {
          if (m.type === 'CREDIT_CARD') map.set(m.id, m.name)
        }
        setCardNames(map)
      })
      .catch(() => {})
  }, [user?.token])

  useEffect(() => {
    let active = true

    if (!user?.token) {
      setPreviousSummary(null)
      return () => { active = false }
    }

    const previousMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    void getMonthlySummary(previousMonth)
      .then((summary) => {
        if (active) setPreviousSummary(summary)
      })
      .catch(() => {
        if (active) setPreviousSummary(null)
      })

    return () => { active = false }
  }, [selectedDate, summaryRefresh, user?.token])

  /* ── Quick-add modal ── */
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure()
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [hidden, setHidden] = useState(false)

  const handleAddIncome = useCallback(() => { setModalType('INCOME'); openModal() }, [openModal])
  const handleAddExpense = useCallback(() => { setModalType('EXPENSE'); openModal() }, [openModal])

  return (
    <Box>
      {/* Purple hero with the month's net — same shell as Earnings/Expenses/Household. */}
      <NetHero
        income={periodData.income}
        expense={periodData.expense}
        date={selectedDate}
        hidden={hidden}
        onToggleHidden={() => setHidden((value) => !value)}
      />
    <Box {...NU_SHEET_WRAP}>
      {/* Nubank-style sheet: white body, hairline-separated sections. */}
      <MotionBox
        className="nu-dashboard" pb={NU_SHEET_PB}
        variants={containerV}
        initial="hidden"
        animate="show"
        bg="var(--nu-page)"
        borderTopRadius="24px"
        borderBottomRadius={{ base: 0, md: '24px' }}
        overflow="hidden"
        boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
      >
        {loading ? (
          <Skeleton height={{ base: '360px', md: '260px' }} startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
        ) : monthSummary ? (
          <MotionBox variants={riseV}>
            <MonthHero
              income={periodData.income}
              expense={periodData.expense}
              previousExpense={previousSummary?.totalExpense ?? null}
              transactions={transactions}
              date={selectedDate}
              hidden={hidden}
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
              onPageChange={onPageChange}
            />
          </MotionBox>
        ) : null}

        <MotionBox variants={riseV}>
          <NuSection title={t('dashboard.monthlyRhythm')} subtitle={t('dashboard.monthlyRhythmCaption')}>
            {/* One row: a swipeable pair on phones (second card peeks in), two columns from md. */}
            <Grid
              templateColumns={{ base: 'repeat(2, 86%)', md: 'repeat(2, minmax(0, 1fr))' }}
              gap={{ base: 3, md: 5 }}
              alignItems="stretch"
              overflowX={{ base: 'auto', md: 'visible' }}
              mx={{ base: -4, md: 0 }}
              px={{ base: 4, md: 0 }}
              pb={{ base: 1, md: 0 }}
              sx={{
                scrollSnapType: { base: 'x mandatory', md: 'none' },
                scrollPaddingInline: '16px',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '& > *': { scrollSnapAlign: 'start' },
              }}
            >
              <CashPace transactions={transactions} selectedDate={selectedDate} dateBasis="activity" kind="income" />
              <CashPace transactions={transactions} selectedDate={selectedDate} dateBasis="activity" kind="expense" />
            </Grid>
          </NuSection>
        </MotionBox>

        <MotionBox variants={riseV}>
          <NuSection>
            <CategorySpendingPaces
              transactions={transactions}
              selectedDate={selectedDate}
              dateBasis="activity"
              userId={user?.id ?? null}
            />
          </NuSection>
        </MotionBox>

        <MotionBox variants={riseV}>
          <NuSection>
            <DescriptionSpendingPaces
              transactions={transactions}
              selectedDate={selectedDate}
              dateBasis="activity"
              userId={user?.id ?? null}
            />
          </NuSection>
        </MotionBox>

        <MotionBox variants={riseV}>
          <NuSection title={t('dashboard.topMerchants')} subtitle={t('dashboard.topMerchantsCaption')}>
            <TopMerchants
              transactions={behaviourPeriodData.transactions}
              historyTransactions={transactions}
              selectedDate={selectedDate}
            />
          </NuSection>
        </MotionBox>

        <MotionBox variants={riseV}>
          <NuSection title={t('dashboard.installments')} subtitle={t('dashboard.installmentsCaption')}>
            <InstallmentCarousel
              plans={installmentPlans}
              selectedDate={selectedDate}
              onManage={() => onPageChange?.('installments')}
            />
          </NuSection>
        </MotionBox>

        <MotionBox variants={riseV}>
          <NuSection title={t('dashboard.paymentsAndActivity')} subtitle={t('dashboard.activityCaption')}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
              <UpcomingPayments transactions={transactions} cardNames={cardNames} onPageChange={onPageChange} />
              <RecentActivity transactions={behaviourPeriodData.transactions} dateBasis="activity" onPageChange={onPageChange} />
            </Grid>
          </NuSection>
        </MotionBox>
      </MotionBox>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        type={modalType}
        transactions={transactions}
        onTransactionCreated={() => { closeModal(); setSummaryRefresh((value) => value + 1); void loadData() }}
        onRefresh={() => { setSummaryRefresh((value) => value + 1); void loadData() }}
      />
    </Box>
    </Box>
  )
}
