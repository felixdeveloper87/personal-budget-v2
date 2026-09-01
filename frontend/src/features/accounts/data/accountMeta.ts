import type { AccountType } from '../../../types'

export const ACCOUNT_LABELS: Record<AccountType, string> = {
  CURRENT: 'Current account',
  SAVINGS: 'Savings account',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit account (legacy)',
}

export const ACCOUNT_HELP: Record<AccountType, string> = {
  CURRENT: 'Money held in a current account. Supports an overdraft limit.',
  SAVINGS: 'Money held in a savings account.',
  CASH: 'Physical cash balance.',
  CREDIT_CARD: 'Existing credit account. New cards should be created under Cards.',
}

export const CREATABLE_ACCOUNT_TYPES: AccountType[] = ['CURRENT', 'SAVINGS', 'CASH']
export const ACCOUNT_TYPE_ORDER: AccountType[] = ['CURRENT', 'SAVINGS', 'CASH', 'CREDIT_CARD']

export const ACCOUNT_GROUP_LABELS: Record<AccountType, string> = {
  CURRENT: 'Current accounts',
  SAVINGS: 'Savings accounts',
  CASH: 'Cash',
  CREDIT_CARD: 'Legacy credit accounts',
}

const ACCOUNT_NAME_SUFFIX: Record<AccountType, string> = {
  CURRENT: 'Current',
  SAVINGS: 'Savings',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit',
}

/** Generate the account display name from issuer + type. */
export const accountName = (institution: string, type: AccountType) => {
  const issuer = institution.trim()
  if (type === 'CASH') return issuer ? `${issuer} Cash` : 'Cash'
  return issuer ? `${issuer} ${ACCOUNT_NAME_SUFFIX[type]}` : ''
}
