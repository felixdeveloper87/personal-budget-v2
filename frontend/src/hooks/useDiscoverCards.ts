import { useMemo } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  PieChart,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from '../components/ui/icons'
import type {
  DiscoverCardItem,
  DiscoverPreviousPeriod,
} from '../components/discover/types'
import {
  buildCategoryBreakdown,
  getTopExpenses,
  getUpcomingPayments,
} from '../components/discover/utils'
import type { Transaction } from '../types'

interface UseDiscoverCardsArgs {
  transactions: Transaction[]
  allTransactions: Transaction[]
  previousPeriod?: DiscoverPreviousPeriod
  income: number
  expense: number
  balance: number
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function formatMoney(value: number) {
  return moneyFormatter.format(Math.abs(value))
}

function pickTopCards(candidates: DiscoverCardItem[], limit = 3): DiscoverCardItem[] {
  return [...candidates]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map((card, index) => ({ ...card, featured: index === 0 }))
}

export function useDiscoverCards({
  transactions,
  allTransactions,
  previousPeriod,
  income,
  expense,
  balance,
}: UseDiscoverCardsArgs): DiscoverCardItem[] {
  return useMemo(() => {
    const candidates: DiscoverCardItem[] = []
    const upcomingPayments = getUpcomingPayments(allTransactions)
    const upcomingTotal = upcomingPayments.reduce((sum, tx) => sum + tx.amount, 0)
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

    if (balance < 0) {
      candidates.push({
        id: 'negative-balance',
        title: 'Spending exceeds income',
        description: 'Your expenses are higher than your income for this period.',
        icon: AlertTriangle,
        accent: 'red',
        cta: 'Review expenses',
        modalId: 'spending-alert',
        badge: 'Needs attention',
        priority: 100,
        value: formatMoney(balance),
      })
    }

    if (upcomingPayments.length > 0) {
      candidates.push({
        id: 'upcoming-payments',
        title: 'Upcoming payments',
        description: `${upcomingPayments.length} payment${upcomingPayments.length === 1 ? '' : 's'} due in the next 7 days.`,
        icon: CalendarClock,
        accent: 'amber',
        cta: 'View payments',
        modalId: 'upcoming-payments',
        badge: 'Next 7 days',
        priority: 95,
        value: formatMoney(upcomingTotal),
      })
    }

    if (income > 0) {
      candidates.push({
        id: 'savings-rate',
        title: 'Savings rate',
        description:
          savingsRate >= 20
            ? 'You are keeping at least 20% of your income this period.'
            : savingsRate >= 0
              ? 'See what is left after expenses and where you can improve.'
              : 'Expenses have moved your savings rate below zero.',
        icon: savingsRate >= 0 ? TrendingUp : TrendingDown,
        accent: savingsRate >= 20 ? 'green' : savingsRate >= 0 ? 'neutral' : 'red',
        cta: 'See breakdown',
        modalId: 'savings-rate',
        priority: 90,
        value: `${savingsRate.toFixed(0)}%`,
      })
    }

    if (previousPeriod && previousPeriod.expense > 0) {
      const change = ((expense - previousPeriod.expense) / previousPeriod.expense) * 100
      const spendingIncreased = change > 0

      candidates.push({
        id: 'mom-spending',
        title: 'Spending comparison',
        description: `Current spending compared with ${previousPeriod.label}.`,
        icon: spendingIncreased ? TrendingUp : TrendingDown,
        accent: spendingIncreased ? 'red' : 'green',
        cta: 'Compare periods',
        modalId: 'mom-comparison',
        priority: 85,
        value: formatMoney(expense),
        delta: {
          label: `${change >= 0 ? '+' : ''}${change.toFixed(0)}% vs ${previousPeriod.label}`,
          direction: spendingIncreased ? 'up' : 'down',
          tone: change === 0 ? 'neutral' : spendingIncreased ? 'negative' : 'positive',
        },
      })
    }

    const biggestExpense = getTopExpenses(transactions, 1)[0]
    if (biggestExpense) {
      candidates.push({
        id: 'biggest-expense',
        title: 'Biggest expense',
        description: biggestExpense.description || biggestExpense.category,
        icon: ReceiptText,
        accent: 'red',
        cta: 'View spending',
        modalId: 'category-breakdown',
        priority: 75,
        value: formatMoney(biggestExpense.amount),
      })
    }

    if (previousPeriod) {
      const currentCategories = buildCategoryBreakdown(transactions)
      const previousCategories = new Map(
        buildCategoryBreakdown(previousPeriod.transactions).map((row) => [row.name, row.total]),
      )
      const growingCategory = currentCategories
        .map((row) => {
          const previousTotal = previousCategories.get(row.name) ?? 0
          const increase = row.total - previousTotal
          const increasePercent = previousTotal > 0 ? (increase / previousTotal) * 100 : 100
          return { ...row, increase, increasePercent }
        })
        .filter((row) => row.increase >= 25 && row.increasePercent >= 15)
        .sort((a, b) => b.increase - a.increase)[0]

      if (growingCategory) {
        candidates.push({
          id: 'growing-category',
          title: 'Category on the rise',
          description: `${growingCategory.name} increased most compared with ${previousPeriod.label}.`,
          icon: PieChart,
          accent: 'amber',
          cta: 'Compare categories',
          modalId: 'mom-comparison',
          priority: 70,
          value: formatMoney(growingCategory.total),
          delta: {
            label: `+${growingCategory.increasePercent.toFixed(0)}%`,
            direction: 'up',
            tone: 'negative',
          },
        })
      }
    }

    if (transactions.length < 5) {
      candidates.push({
        id: 'onboarding-track',
        title: 'Build your picture',
        description: 'Add a few transactions to unlock more personalised comparisons.',
        icon: Wallet,
        accent: 'neutral',
        cta: 'See progress',
        modalId: 'getting-started',
        badge: 'Getting started',
        priority: 55,
        value: `${transactions.length}/5`,
      })
    }

    return pickTopCards(candidates)
  }, [allTransactions, balance, expense, income, previousPeriod, transactions])
}
