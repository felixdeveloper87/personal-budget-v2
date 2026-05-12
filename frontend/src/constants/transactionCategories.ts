/**
 * Category labels persisted as plain strings on the backend.
 * Primary row (6 incl. "Others"); extra row appears after choosing Others.
 */

export const TRANSACTION_INCOME_PRIMARY = [
  'Salary',
  'Freelance',
  'Investments',
  'Rental',
  'Bonus',
  'Others',
] as const

export const TRANSACTION_INCOME_OTHER_OPTIONS = [
  'Business',
  'Gifts',
  'Benefits',
  'Refunds',
  'Side hustle',
  'Cashback',
] as const

export const TRANSACTION_EXPENSE_PRIMARY = [
  'Groceries',
  'Rent',
  'Utilities',
  'Transport',
  'Health',
  'Others',
] as const

export const TRANSACTION_EXPENSE_OTHER_OPTIONS = [
  'Dining out',
  'Shopping',
  'Subscriptions',
  'Entertainment',
  'Insurance',
  'Education',
] as const

export function getAllIncomeCategoryLabels(): string[] {
  return [
    ...TRANSACTION_INCOME_PRIMARY,
    ...TRANSACTION_INCOME_OTHER_OPTIONS,
  ]
}

export function getAllExpenseCategoryLabels(): string[] {
  return [
    ...TRANSACTION_EXPENSE_PRIMARY,
    ...TRANSACTION_EXPENSE_OTHER_OPTIONS,
  ]
}
