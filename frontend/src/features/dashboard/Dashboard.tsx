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
import { getTransactionDate, type TransactionDateBasis } from '../../utils/transactionDates'
import './theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from './components/motion'
import SectionLabel from './components/SectionLabel'
import MonthHero from './components/MonthHero'
import StatCard from './components/StatCard'
import CashFlowChart from './components/CashFlowChart'
import SpendingPace from './components/SpendingPace'
import TopMerchants from './components/TopMerchants'
import SpendingMix from './components/SpendingMix'
import UpcomingPayments from './components/UpcomingPayments'
import RecentActivity from './components/RecentActivity'
import PersonalisedInsight from './components/PersonalisedInsight'
import type { PersonalInsightData } from './components/PersonalisedInsight'
import CommitmentsPanel from './components/CommitmentsPanel'
import type { CommitmentsData } from './components/CommitmentsPanel'
import InsightList from './components/InsightList'
import type { InsightItem } from './components/InsightList'
import { fmtCurrency } from './components/format'
import { daysInMonth, merchantStats } from './insights'

export interface DashboardProps {
  onPageChange?: (page: AppPage) => void
}

// Shared with AccountsPage / TransfersPage so the privacy toggle stays in sync.
const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'

export default function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth()

  // Home is a snapshot of the current month — period browsing lives on the
  // Behaviour / Payments / Reports pages, so there's no navigator here.
  const { selectedDate, selectedPeriod } = usePeriodNavigator()

  const { transactions, monthSummary, loading, loadData } = useDashboardData(
    selectedDate,
    selectedPeriod,
  )

  // Home is anchored to the Payments (cash-flow) lens — the Behaviour lens has
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
  // cash-flow lens the rest of the home is anchored to.
  const behaviourPeriodData = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    selectedDate,
    'activity',
  )

  // Previous period on the Behaviour lens, so merchant comparisons ("last month
  // you spent £X at Lidl") reflect when purchases actually happened.
  const previousBehaviourPeriodData = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    previousDate,
    'activity',
  )

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
  const commitments = useMemo<CommitmentsData>(() => {
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

  /* ── Personalised insight: biggest category move vs previous period ── */
  const personalInsight = useMemo<PersonalInsightData>(() => {
    const today = new Date()
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    )
    const periodContainsToday =
      endOfToday >= periodData.startDate &&
      new Date(today.getFullYear(), today.getMonth(), today.getDate()) <= periodData.endDate

    const currentTransactions = periodContainsToday
      ? periodData.transactions.filter((t) => getTransactionDate(t, dateBasis) <= endOfToday)
      : periodData.transactions

    const previousTransactions = (() => {
      if (!periodContainsToday) return previousPeriodData.transactions

      const currentCutoff = new Date(
        Math.min(endOfToday.getTime(), periodData.endDate.getTime()),
      )
      const elapsedMs = currentCutoff.getTime() - periodData.startDate.getTime()
      const previousCutoff = new Date(
        Math.min(
          previousPeriodData.startDate.getTime() + elapsedMs,
          previousPeriodData.endDate.getTime(),
        ),
      )

      return previousPeriodData.transactions.filter(
        (t) => getTransactionDate(t, dateBasis) <= previousCutoff,
      )
    })()

    const sumByCategory = (txns: typeof periodData.transactions) => {
      const map = new Map<string, number>()
      for (const t of txns) {
        if (t.type !== 'EXPENSE') continue
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
      }
      return map
    }

    const current = sumByCategory(currentTransactions)
    const previous = sumByCategory(previousTransactions)

    // Find the category with the biggest absolute change vs last period.
    let topCategory = ''
    let topDelta = 0
    for (const [cat, amt] of current) {
      const delta = amt - (previous.get(cat) ?? 0)
      if (Math.abs(delta) > Math.abs(topDelta)) {
        topDelta = delta
        topCategory = cat
      }
    }

    const currentIncome = currentTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const previousIncome = previousTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    const currentExpense = currentTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    const previousExpense = previousTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    const savingsRate =
      currentIncome > 0
        ? Math.round(((currentIncome - currentExpense) / currentIncome) * 100)
        : null
    const overallExpenseDelta = currentExpense - previousExpense
    const overallExpensePct = previousExpense > 0
      ? Math.round((Math.abs(overallExpenseDelta) / previousExpense) * 100)
      : currentExpense > 0
        ? 100
        : 0
    const overallExpenseLabel =
      overallExpenseDelta === 0
        ? '0%'
        : `${overallExpenseDelta < 0 ? '−' : '+'}${overallExpensePct}%`
    const overallExpensePositive = overallExpenseDelta <= 0

    const comparisonLine = (category: string): string | null => {
      const currentAmt = current.get(category) ?? 0
      const previousAmt = previous.get(category) ?? 0
      const delta = currentAmt - previousAmt
      if (currentAmt === 0 && previousAmt === 0) return null
      if (delta === 0) return `${category} is flat at ${fmtCurrency(currentAmt)}.`

      const pct = previousAmt > 0 ? Math.round((Math.abs(delta) / previousAmt) * 100) : 100
      return delta < 0
        ? `${category} is ${fmtCurrency(Math.abs(delta))} (${pct}%) below the same point last period.`
        : `${category} is up ${fmtCurrency(Math.abs(delta))} (${pct}%) versus the same point last period.`
    }

    const findCategory = (wanted: string): string | null => {
      const lower = wanted.toLowerCase()
      for (const category of new Set([...current.keys(), ...previous.keys()])) {
        if (category.toLowerCase() === lower) return category
      }
      return null
    }

    const extraLines = ['Shopping', 'Transport']
      .map(findCategory)
      .filter((category): category is string => Boolean(category) && category !== topCategory)
      .map(comparisonLine)
      .filter((line): line is string => Boolean(line))

    const incomeDelta = currentIncome - previousIncome
    const incomePct = previousIncome > 0
      ? Math.round((Math.abs(incomeDelta) / previousIncome) * 100)
      : 100
    const incomeLine =
      incomeDelta === 0
        ? `Income is flat versus the same point last period.`
        : incomeDelta > 0
          ? `Income is ${incomePct}% above the same point last period.`
          : `Income is ${incomePct}% below the same point last period.`

    if (!topCategory || topDelta === 0) {
      const bodyLines =
        savingsRate !== null
          ? [incomeLine, `You are keeping a ${savingsRate}% savings rate.`, ...extraLines]
          : [incomeLine, ...(extraLines.length ? extraLines : ['Keep logging transactions to surface trends across categories.'])]

      return {
        headline: 'Your spending is steady this period.',
        body: bodyLines.join(' '),
        bodyLines,
        deltaLabel: overallExpenseLabel,
        deltaPositive: overallExpensePositive,
        href: 'planning',
      }
    }

    const spendingLess = topDelta < 0
    const topLine = comparisonLine(topCategory)
    const bodyLines = [incomeLine, topLine, ...extraLines].filter(
      (line): line is string => Boolean(line),
    )

    return {
      headline: spendingLess
        ? `You are spending less on ${topCategory.toLowerCase()} this period.`
        : `Your ${topCategory.toLowerCase()} spending is climbing this period.`,
      body: bodyLines.join(' '),
      bodyLines,
      deltaLabel: overallExpenseLabel,
      deltaPositive: overallExpensePositive,
      href: 'planning',
    }
  }, [periodData, previousPeriodData, dateBasis])

  /* ── "For you" editorial list ── */
  const insights = useMemo<InsightItem[]>(() => {
    const result: InsightItem[] = []
    const { income, expense, balance, transactions: txns } = periodData

    if (expense > income) {
      result.push({
        id: 'overspend',
        severity: 'attention',
        tag: 'Needs attention',
        title: 'Spending exceeds income',
        valueLabel: fmtCurrency(Math.abs(balance), { minimumFractionDigits: 2 }),
        description: 'Expenses are higher than income this period.',
        href: 'behaviour',
        icon: 'warn',
      })
    }

    // Month-end pace projection — only meaningful a few days into the live month.
    const today = new Date()
    const isCurrentMonth =
      selectedPeriod === 'month' &&
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth()
    if (isCurrentMonth && today.getDate() >= 3 && expense > 0) {
      const totalDays = daysInMonth(today.getFullYear(), today.getMonth())
      const projected = (expense / today.getDate()) * totalDays
      result.push({
        id: 'pace',
        severity: income > 0 && projected > income ? 'attention' : 'info',
        tag: 'Month-end pace',
        title: `On pace for ~${fmtCurrency(projected)}`,
        description: `You are averaging ${fmtCurrency(expense / today.getDate())} a day across ${today.getDate()} days.`,
        href: 'behaviour',
        icon: 'gauge',
      })
    }

    const now = Date.now()
    const in7 = now + 7 * 24 * 60 * 60 * 1000
    const upcoming = txns.filter((t) => {
      const d = new Date(t.paymentDate ?? t.dateTime).getTime()
      return d >= now && d <= in7 && t.type === 'EXPENSE'
    })
    if (upcoming.length > 0) {
      const upcomingTotal = upcoming.reduce((s, t) => s + t.amount, 0)
      result.push({
        id: 'upcoming',
        severity: 'info',
        tag: 'Next 7 days',
        title: `${upcoming.length} payment${upcoming.length !== 1 ? 's' : ''} due`,
        valueLabel: fmtCurrency(upcomingTotal),
        description: 'Upcoming expense payments scheduled this week.',
        href: 'payments',
        icon: 'calendar',
      })
    }

    // Last period's top merchant, e.g. "Last month you spent £84 at Lidl".
    const prevMerchants = merchantStats(previousBehaviourPeriodData.transactions)
    if (prevMerchants.length > 0) {
      const top = prevMerchants[0]
      const sameNow = merchantStats(behaviourPeriodData.transactions).find((m) => m.key === top.key)
      const periodWord = selectedPeriod === 'month' ? 'month' : selectedPeriod
      result.push({
        id: 'top-merchant',
        severity: 'info',
        tag: `Last ${periodWord}`,
        title: `You spent ${fmtCurrency(top.total)} at ${top.name}`,
        description:
          `${top.count} purchase${top.count !== 1 ? 's' : ''} — your top merchant last ${periodWord}.` +
          (sameNow ? ` This ${periodWord} you are at ${fmtCurrency(sameNow.total)} so far.` : ''),
        href: 'all-transactions',
        icon: 'store',
      })
    }

    // Largest single expense, when it dominates the period.
    const biggest = txns.reduce<(typeof txns)[number] | null>(
      (acc, t) => (t.type === 'EXPENSE' && (!acc || t.amount > acc.amount) ? t : acc),
      null,
    )
    if (biggest && expense > 0 && biggest.amount / expense >= 0.15) {
      result.push({
        id: 'big-ticket',
        severity: 'info',
        tag: 'Largest expense',
        title: biggest.description?.trim() || biggest.category,
        valueLabel: fmtCurrency(biggest.amount),
        description: `${Math.round((biggest.amount / expense) * 100)}% of this period's spending in a single purchase.`,
        href: 'all-transactions',
        icon: 'receipt',
      })
    }

    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : -100
    result.push({
      id: 'savings-rate',
      severity: 'info',
      tag: 'Savings rate',
      title: savingsRate >= 0 ? `At ${savingsRate}%` : `Down to ${savingsRate}%`,
      description:
        savingsRate >= 0
          ? 'Income is covering expenses with savings to spare.'
          : 'Expenses are exceeding income this period.',
      href: 'planning',
      icon: 'trend-down',
    })

    return result.slice(0, 5)
  }, [periodData, behaviourPeriodData, previousBehaviourPeriodData, selectedDate, selectedPeriod])

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
              net={periodData.balance}
              transactions={periodData.transactions.length}
              date={selectedDate}
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
            />
          </MotionBox>
        ) : null}

        {/* Cash flow chart (same period and payments lens as the hero) */}
        <MotionBox variants={riseV}>
          <CashFlowChart
            transactions={periodData.transactions}
            selectedDate={selectedDate}
            periodType={selectedPeriod}
            dateBasis={dateBasis}
            totals={{ income: periodData.income, expense: periodData.expense }}
          />
        </MotionBox>

        {/* Spending pace · Personalised insight */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <SpendingPace transactions={transactions} selectedDate={selectedDate} dateBasis="activity" />
          </MotionBox>
          <MotionBox variants={riseV}>
            <PersonalisedInsight insight={personalInsight} onPageChange={onPageChange} />
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
              previousTransactions={previousBehaviourPeriodData.transactions}
            />
          </MotionBox>
        </Grid>

        {/* Stat row: Net available · Month forecast */}
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
        <MotionBox variants={riseV}>
          <SectionLabel>Commitments &amp; insights</SectionLabel>
        </MotionBox>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 4, md: 5 }} alignItems="stretch">
          <MotionBox variants={riseV}>
            <CommitmentsPanel
              commitments={commitments}
              onManageInstallments={() => onPageChange?.('installments')}
              onManageFixed={() => onPageChange?.('fixed-payments')}
            />
          </MotionBox>
          <MotionBox variants={riseV}>
            <InsightList insights={insights} onPageChange={onPageChange} />
          </MotionBox>
        </Grid>

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
