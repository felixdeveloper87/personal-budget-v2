import {
  exportTransactionsCsv,
  listInstallmentPlans,
  listRecurringTransactions,
} from '../api'
import { buildCsv, downloadBlob, downloadCsv } from './csv'
import { getInstallmentPlanTitle } from './installments'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Exports the user's full financial history as three CSV files: transactions,
 * installment plans and fixed payments. Downloads are staggered slightly so the
 * browser reliably saves all of them.
 */
export async function exportAllData(): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 10)

  const [txBlob, plans, recurring] = await Promise.all([
    exportTransactionsCsv(),
    listInstallmentPlans(),
    listRecurringTransactions(),
  ])

  downloadBlob(`transactions-${stamp}.csv`, txBlob)

  const planRows = plans.map((plan) => {
    const sorted = [...plan.transactions].sort((a, b) => a.installmentNumber - b.installmentNumber)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    return [
      first?.description ? getInstallmentPlanTitle(first.description) : '',
      first?.category ?? '',
      plan.installmentValue,
      plan.totalAmount,
      plan.totalInstallments,
      first?.date ?? '',
      last?.date ?? '',
      plan.accountName ?? '',
      plan.paymentMethodName ?? '',
    ]
  })
  await sleep(200)
  downloadCsv(
    `installment-plans-${stamp}.csv`,
    buildCsv(
      ['Description', 'Category', 'Installment Value', 'Total Amount', 'Installments', 'First Date', 'Last Date', 'Account', 'Payment Method'],
      planRows,
    ),
  )

  const recurringRows = recurring.map((item) => [
    item.description,
    item.category,
    item.type,
    item.amount,
    item.dayOfMonth,
    item.active ? 'Active' : 'Cancelled',
    item.startDate,
    item.endDate ?? '',
    item.nextRunDate,
    item.accountName ?? '',
    item.paymentMethodName ?? '',
  ])
  await sleep(200)
  downloadCsv(
    `fixed-payments-${stamp}.csv`,
    buildCsv(
      ['Description', 'Category', 'Type', 'Amount', 'Day Of Month', 'Status', 'Start Date', 'End Date', 'Next Run', 'Account', 'Payment Method'],
      recurringRows,
    ),
  )
}
