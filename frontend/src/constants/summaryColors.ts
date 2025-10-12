// 🎨 Cores centralizadas para os cards do Financial Summary
// Evita duplicação entre SummarySection e SummaryCardModal

export const SUMMARY_CARD_COLORS = {
  transactions: {
    color: 'blue.600',
    bg: 'blue.100',
    bgDark: '#0f172a',
    textColor: 'blue.700',
    textColorDark: 'blue.100',
    title: 'Transaction Analytics',
    subtitle: 'Complete overview of your activity',
  },
  income: {
    color: 'green.600',
    bg: 'green.100',
    bgDark: '#0f1b0f',
    textColor: 'green.700',
    textColorDark: 'green.100',
    title: 'Income Analysis',
    subtitle: 'Track and visualize your income streams',
  },
  expenses: {
    color: 'red.600',
    bg: 'red.100',
    bgDark: '#1a0f0f',
    textColor: 'red.700',
    textColorDark: 'red.100',
    title: 'Expense Analysis',
    subtitle: 'See where your money goes',
  },
  balance: {
    color: 'purple.600',
    bg: 'purple.100',
    bgDark: '#1a0f1a',
    textColor: 'purple.700',
    textColorDark: 'purple.100',
    title: 'Balance Overview',
    subtitle: 'Understand your overall financial health',
  },
} as const

export type SummaryCardType = keyof typeof SUMMARY_CARD_COLORS
