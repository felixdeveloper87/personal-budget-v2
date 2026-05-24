import { useMemo } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Layers,
  Lightbulb,
  PieChart,
  Shield,
  TrendingUp,
  Wallet,
} from '../components/ui/icons'
import type { DiscoverCardItem } from '../components/discover/types'
import { useTransactionInsights } from './useTransactionInsights'
import type { Transaction } from '../types'

interface UseDiscoverCardsArgs {
  transactions: Transaction[]
  selectedPeriod: string
  income: number
  expense: number
  balance: number
}

function formatMoney(value: number) {
  return `£${Math.abs(value).toFixed(2)}`
}

function pickTopCards(candidates: DiscoverCardItem[], limit = 3): DiscoverCardItem[] {
  const sorted = [...candidates].sort((a, b) => b.priority - a.priority)
  const picked: DiscoverCardItem[] = []
  const seen = new Set<string>()

  for (const card of sorted) {
    if (picked.length >= limit) break
    if (seen.has(card.id)) continue
    seen.add(card.id)
    picked.push(card)
  }

  if (picked.length > 0) {
    picked[0] = { ...picked[0], featured: true }
  }

  return picked
}

export function useDiscoverCards({
  transactions,
  selectedPeriod,
  income,
  expense,
  balance,
}: UseDiscoverCardsArgs): DiscoverCardItem[] {
  const insights = useTransactionInsights(transactions, selectedPeriod)

  return useMemo(() => {
    const candidates: DiscoverCardItem[] = []
    const hasData = insights.totalTransactions > 0

    if (balance < 0) {
      candidates.push({
        id: 'negative-balance',
        title: 'Spending exceeds income',
        description: `You're ${formatMoney(balance)} over this period. Review recent expenses to get back on track.`,
        icon: AlertTriangle,
        accent: 'red',
        cta: 'See details',
        modalId: 'spending-alert',
        badge: 'Needs attention',
        priority: 100,
      })
    }

    if (income > 0) {
      const rate = insights.savingsRate

      candidates.push({
        id: 'savings-rate',
        title: 'Your savings rate',
        description:
          rate >= 20
            ? `You're saving ${rate.toFixed(0)}% of income this period — ${rate >= 30 ? 'excellent progress' : 'solid work'}.`
            : rate >= 0
              ? `You're saving ${rate.toFixed(0)}% of income. See how to push toward 20%+.`
              : `Expenses exceed income by ${formatMoney(Math.abs(balance))}. See the breakdown.`,
        icon: TrendingUp,
        accent: rate >= 20 ? 'green' : rate >= 0 ? 'blue' : 'red',
        cta: 'See breakdown',
        modalId: 'savings-rate',
        badge: 'Based on your data',
        priority: 90,
      })
    }

    if (insights.mostUsedCategory) {
      candidates.push({
        id: 'top-category',
        title: 'Top spending category',
        description: `${insights.mostUsedCategory} is your most active category this period. Explore the full breakdown.`,
        icon: PieChart,
        accent: 'violet',
        cta: 'See breakdown',
        modalId: 'category-breakdown',
        badge: hasData ? 'This period' : undefined,
        priority: 80,
      })
    }

    if (expense > 0) {
      const monthlyEstimate = selectedPeriod === 'month'
        ? expense
        : selectedPeriod === 'year'
          ? expense / 12
          : expense * 4
      const monthsCovered = monthlyEstimate > 0 ? balance / monthlyEstimate : 0
      const monthsLabel =
        monthsCovered >= 6
          ? 'You may already have a strong safety buffer.'
          : monthsCovered >= 1
            ? `About ${monthsCovered.toFixed(1)} months of expenses covered at your current balance.`
            : 'Build a cushion so unexpected costs don\'t derail your budget.'

      candidates.push({
        id: 'emergency-fund',
        title: 'Safety buffer',
        description: monthsLabel,
        icon: Shield,
        accent: 'amber',
        cta: 'Check coverage',
        modalId: 'emergency-fund',
        badge: 'Based on your data',
        priority: 70,
      })
    }

    if (income > 0 && expense > 0) {
      const spendRatio = (expense / income) * 100
      candidates.push({
        id: 'budget-split',
        title: 'Budget split',
        description: `You're allocating ${spendRatio.toFixed(0)}% to spending and ${Math.max(0, 100 - spendRatio).toFixed(0)}% to savings this period.`,
        icon: Layers,
        accent: 'violet',
        cta: 'Compare to 50/30/20',
        modalId: 'budget-split',
        priority: 60,
      })
    }

    if (insights.totalTransactions < 5) {
      candidates.push({
        id: 'onboarding-track',
        title: 'Build your picture',
        description: 'Add a few transactions so we can surface smarter, personalised tips here.',
        icon: Wallet,
        accent: 'blue',
        cta: 'Learn how',
        modalId: 'getting-started',
        badge: 'Getting started',
        priority: 55,
      })
    }

    if (insights.totalTransactions >= 5 && insights.totalTransactions < 15) {
      candidates.push({
        id: 'onboarding-categories',
        title: 'Organise by category',
        description: 'See where your money goes with charts and category-level insights.',
        icon: PieChart,
        accent: 'violet',
        cta: 'See how it works',
        modalId: 'category-guide',
        priority: 50,
      })
    }

    candidates.push({
      id: 'compound-interest',
      title: 'The magic of time',
      description: 'See how small, consistent savings can grow into a meaningful sum over the years.',
      icon: BarChart3,
      accent: 'blue',
      cta: 'Run simulation',
      modalId: 'compound-interest',
      priority: 30,
    })

    candidates.push({
      id: 'budget-rule-edu',
      title: 'Rule 50/30/20',
      description: '50% needs, 30% wants, 20% savings — the simplest framework to organise your money.',
      icon: Lightbulb,
      accent: 'amber',
      cta: 'Learn the rule',
      modalId: 'budget-split',
      priority: 20,
    })

    return pickTopCards(candidates, 3)
  }, [
    balance,
    expense,
    income,
    insights.mostUsedCategory,
    insights.savingsRate,
    insights.totalTransactions,
    selectedPeriod,
  ])
}
