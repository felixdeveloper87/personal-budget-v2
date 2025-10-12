// 🎨 Cores centralizadas para os cards do Financial Summary
// Evita duplicação entre SummarySection e SummaryCardModal

export const SUMMARY_CARD_COLORS = {
  transactions: {
    color: 'blue.500',
    bg: 'blue.50',
    bgDark: '#0f172a',
    textColor: 'blue.600',
    textColorDark: 'blue.100',
    title: 'Transaction Analytics',
    subtitle: 'Complete overview of your activity',
  },
  income: {
    color: 'green.500',
    bg: 'green.50',
    bgDark: '#0f1b0f',
    textColor: 'green.600',
    textColorDark: 'green.100',
    title: 'Income Analysis',
    subtitle: 'Track and visualize your income streams',
  },
  expenses: {
    color: 'red.500',
    bg: 'red.50',
    bgDark: '#1a0f0f',
    textColor: 'red.600',
    textColorDark: 'red.100',
    title: 'Expense Analysis',
    subtitle: 'See where your money goes',
  },
  balance: {
    color: 'purple.500',
    bg: 'purple.50',
    bgDark: '#1a0f1a',
    textColor: 'purple.600',
    textColorDark: 'purple.100',
    title: 'Balance Overview',
    subtitle: 'Understand your overall financial health',
  },
} as const

export type SummaryCardType = keyof typeof SUMMARY_CARD_COLORS
