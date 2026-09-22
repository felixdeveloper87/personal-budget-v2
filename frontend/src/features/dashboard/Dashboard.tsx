import { useCallback, useEffect, useState } from 'react'
import { Box, Grid, Skeleton, VStack, useDisclosure } from '@chakra-ui/react'
import { AddTransactionModal } from '../../components/transactions'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData } from '../../hooks/usePeriodData'
import { useAuth } from '../../contexts/AuthContext'
import {
  listInstallmentPlans,
  listPaymentMethods,
} from '../../api'
import type { InstallmentPlan } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { type TransactionDateBasis } from '../../utils/transactionDates'
import './theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from './components/motion'
import SectionLabel from './components/SectionLabel'
import MonthHero from './components/MonthHero'
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

  /* ── Quick-add modal ── */
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure()
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  const handleAddIncome = useCallback(() => { setModalType('INCOME'); openModal() }, [openModal])
  const handleAddExpense = useCallback(() => { setModalType('EXPENSE'); openModal() }, [openModal])

  return (
    <Box
      minH="100vh"
      maxW="appContent"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
    >
      <MotionBox variants={containerV} initial="hidden" animate="show">
      <VStack spacing={{ base: 5, md: 6 }} align="stretch">

        {/* Hero card — current-month snapshot */}
        {loading ? (
          <Skeleton height="280px" borderRadius="22px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
        ) : monthSummary ? (
          <MotionBox variants={riseV}>
            <MonthHero
              income={periodData.income}
              expense={periodData.expense}
              date={selectedDate}
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
            />
          </MotionBox>
        ) : null}

        {/* Spending pace · Personalised insight */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <CashPace transactions={transactions} selectedDate={selectedDate} dateBasis="activity" kind="expense" />
          </MotionBox>
          <MotionBox variants={riseV}>
            <CashPace transactions={transactions} selectedDate={selectedDate} dateBasis="activity" kind="income" />
          </MotionBox>
        </Grid>

        <MotionBox variants={riseV}>
          <CategorySpendingPaces
            transactions={transactions}
            selectedDate={selectedDate}
            dateBasis="activity"
            userId={user?.id ?? null}
          />
        </MotionBox>

        <MotionBox variants={riseV}>
          <DescriptionSpendingPaces
            transactions={transactions}
            selectedDate={selectedDate}
            dateBasis="activity"
            userId={user?.id ?? null}
          />
        </MotionBox>

        {/* Top merchants */}
        <MotionBox variants={riseV}>
          <TopMerchants
            transactions={behaviourPeriodData.transactions}
            historyTransactions={transactions}
            selectedDate={selectedDate}
          />
        </MotionBox>

        <MotionBox variants={riseV}>
          <SectionLabel>{t('dashboard.monthlyCommitments')}</SectionLabel>
        </MotionBox>
        <MotionBox variants={riseV}>
          <InstallmentCarousel
            plans={installmentPlans}
            selectedDate={selectedDate}
            onManage={() => onPageChange?.('installments')}
          />
        </MotionBox>

        {/* Upcoming payments · Recent activity */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <UpcomingPayments transactions={transactions} cardNames={cardNames} onPageChange={onPageChange} />
          </MotionBox>
          <MotionBox variants={riseV}>
            <RecentActivity transactions={behaviourPeriodData.transactions} dateBasis="activity" onPageChange={onPageChange} />
          </MotionBox>
        </Grid>

        {/* Commitments · For you */}
      </VStack>
      </MotionBox>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        type={modalType}
        transactions={transactions}
        onTransactionCreated={() => { closeModal(); void loadData() }}
        onRefresh={() => void loadData()}
      />
    </Box>
  )
}
