import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Grid, Skeleton, VStack, useDisclosure } from '@chakra-ui/react'
import { AddTransactionModal } from '../../components/transactions'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { usePeriodData, getPreviousPeriodDate } from '../../hooks/usePeriodData'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAccountSummary,
  getCashFlowForecast,
  listInstallmentPlans,
  listPaymentMethods,
  listRecurringTransactions,
} from '../../api'
import { isInstallmentPlanCompleted } from '../../components/installments/InstallmentPlanCard'
import type {
  AccountSummary,
  CashFlowForecast,
  InstallmentPlan,
  RecurringTransaction,
} from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { type TransactionDateBasis } from '../../utils/transactionDates'
import './theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from './components/motion'
import SectionLabel from './components/SectionLabel'
import MonthHero from './components/MonthHero'
import StatCard from './components/StatCard'
import CashPace from './components/SpendingPace'
import TopMerchants from './components/TopMerchants'
import SpendingMix from './components/SpendingMix'
import UpcomingPayments from './components/UpcomingPayments'
import RecentActivity from './components/RecentActivity'
import CommitmentCard from './components/CommitmentCard'
import { fmtCurrency } from './components/format'

export interface DashboardProps {
  onPageChange?: (page: AppPage) => void
}

// Shared with AccountsPage so the balance privacy toggle stays in sync.
const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'

export default function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth()

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

  // Previous period (same basis) so the personalised insight can compare.
  const previousDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const previousPeriodData = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    previousDate,
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
  /* ── Side data: accounts, forecast, installments, recurring ── */
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([])
  // Credit-card id → name, used to fold a card's charges into one fatura row.
  const [cardNames, setCardNames] = useState<Map<number, string>>(() => new Map())

  useEffect(() => {
    if (!user?.token) return
    void getAccountSummary().then(setAccountSummary).catch(() => {})
    void getCashFlowForecast().then(setForecast).catch(() => {})
    void listInstallmentPlans().then(setInstallmentPlans).catch(() => {})
    void listRecurringTransactions().then(setRecurringItems).catch(() => {})
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

  /* ── Net available money: current + cash + savings (everything but cards) ── */
  const netAvailable = useMemo(() => {
    if (!accountSummary) return null
    return accountSummary.accounts
      .filter(
        (a) =>
          a.active &&
          (a.type === 'CURRENT' || a.type === 'CASH' || a.type === 'SAVINGS'),
      )
      .reduce((s, a) => s + a.currentBalance, 0)
  }, [accountSummary])

  /* ── Month forecast: first projected month's closing balance ── */
  const forecastInfo = useMemo(() => {
    if (!forecast || forecast.months.length === 0) return null
    const m = forecast.months[0]
    const label = new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-GB', {
      month: 'long',
    })
    return { projected: m.projectedClosingBalance, label, negative: m.negative }
  }, [forecast])

  /* ── Computed commitments ── */
  const commitments = useMemo(() => {
    const activePlans = installmentPlans.filter((p) => !isInstallmentPlanCompleted(p))
    const pastPlans = installmentPlans.filter((p) => isInstallmentPlanCompleted(p))
    const installMonthly = activePlans.reduce((s, p) => s + p.installmentValue, 0)

    const activeFixed = recurringItems.filter((r) => r.active && r.type === 'EXPENSE')
    const cancelledFixed = recurringItems.filter((r) => !r.active)
    const fixedMonthly = activeFixed.reduce((s, r) => s + r.amount, 0)

    return {
      totalMonthly: installMonthly + fixedMonthly,
      installments: { monthly: installMonthly, active: activePlans.length, past: pastPlans.length },
      fixed: { monthly: fixedMonthly, active: activeFixed.length, cancelled: cancelledFixed.length },
    }
  }, [installmentPlans, recurringItems])

  /* ── Balance privacy toggle (shared with Accounts/Transfers pages) ── */
  const [hideBalances, setHideBalances] = useState(() => {
    try {
      return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  })
  const toggleHideBalances = useCallback(() => {
    setHideBalances((current) => {
      const next = !current
      try {
        localStorage.setItem(BALANCE_VISIBILITY_KEY, String(next))
      } catch {
        /* noop */
      }
      return next
    })
  }, [])

  /* ── Quick-add modal ── */
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure()
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  const handleAddIncome = useCallback(() => { setModalType('INCOME'); openModal() }, [openModal])
  const handleAddExpense = useCallback(() => { setModalType('EXPENSE'); openModal() }, [openModal])

  const netDeltaPositive = periodData.balance >= 0

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

        {/* Spending mix · Top merchants (Behaviour lens: when purchases happened) */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <SpendingMix
              transactions={periodData.transactions}
              previousTransactions={previousPeriodData.transactions}
            />
          </MotionBox>
          <MotionBox variants={riseV}>
            <TopMerchants
              transactions={behaviourPeriodData.transactions}
            />
          </MotionBox>
        </Grid>

        {/* Cash flow chart (same period and payments lens as the hero) */}
        {/* Stat row: Net available · Month forecast */}
        <MotionBox variants={riseV}>
          <SectionLabel>Monthly commitments</SectionLabel>
        </MotionBox>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <CommitmentCard
              kind="installments"
              monthly={commitments.installments.monthly}
              active={commitments.installments.active}
              inactive={commitments.installments.past}
              onManage={() => onPageChange?.('installments')}
            />
          </MotionBox>
          <MotionBox variants={riseV}>
            <CommitmentCard
              kind="fixed"
              monthly={commitments.fixed.monthly}
              active={commitments.fixed.active}
              inactive={commitments.fixed.cancelled}
              onManage={() => onPageChange?.('fixed-payments')}
            />
          </MotionBox>
        </Grid>

        <MotionBox variants={riseV}>
          <SectionLabel>Balance &amp; forecast</SectionLabel>
        </MotionBox>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <StatCard
              eyebrow="Net available money"
              figure={netAvailable !== null ? fmtCurrency(netAvailable) : '—'}
              caption="Balance across your current, cash and savings accounts."
              deltaLabel={`${netDeltaPositive ? '+' : '−'}${fmtCurrency(Math.abs(periodData.balance), { minimumFractionDigits: 2 })}`}
              deltaPositive={netDeltaPositive}
              masked={hideBalances}
              onToggleMask={toggleHideBalances}
            />
          </MotionBox>
          <MotionBox variants={riseV}>
            <StatCard
              eyebrow="Month forecast"
              figure={forecastInfo ? fmtCurrency(forecastInfo.projected) : '—'}
              caption={
                forecastInfo
                  ? `Projected balance at the end of ${forecastInfo.label}.`
                  : 'Add fixed payments and income to see a projection.'
              }
              accent="gold"
              masked={hideBalances}
              onToggleMask={toggleHideBalances}
            />
          </MotionBox>
        </Grid>

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
