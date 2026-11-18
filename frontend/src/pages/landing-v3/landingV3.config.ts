// Illustrative running cash flow. The last point is calculated from the month's totals.
export const DEMO_MONTHS = [
  {
    start: '2026-06-01', days: 30, income: 3820, expenses: 2075,
    balances: [180, 320, 265, 530, 480, 835, 720, 1120, 1080, 1310, 1275, 1640],
  },
  {
    start: '2026-07-01', days: 31, income: 4050, expenses: 2130,
    balances: [220, 480, 390, 615, 950, 780, 1160, 970, 1560, 1680, 1510, 1830],
  },
  {
    start: '2026-08-01', days: 31, income: 4280, expenses: 1992.8,
    balances: [160, 455, 370, 780, 690, 1110, 995, 1490, 1410, 1830, 1700, 2170],
  },
] as const

/** @deprecated Use the shared i18n resources for localised footer copy. */
export const FOOTER = {
  wordmark: 'PERSONAL BUDGET',
  tagline: 'Clarity for your money.',
  note: 'Designed for everyday decisions.',
} as const
