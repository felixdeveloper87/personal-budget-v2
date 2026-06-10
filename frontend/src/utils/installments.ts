import { Transaction, InstallmentPlan } from '../types'

/**
 * Normalize installment descriptions from Portuguese to English
 * Converts "(Parcela X/Y)" to "(Installment X/Y)" for consistency
 */
export function normalizeInstallmentDescription(description: string): string {
  return description.replace(/\(Parcela (\d+\/\d+)\)/g, '(Installment $1)')
}

/** Removes the transaction-specific installment suffix from a plan title. */
export function getInstallmentPlanTitle(description: string): string {
  return description
    .replace(/\s*\((?:Parcela|Installment)\s+\d+\/\d+\)\s*$/i, '')
    .trim()
}

/**
 * Calculate future installments for installment plans
 * Takes the first installment date and calculates future installments with 1-month intervals
 */
export function calculateFutureInstallments(
  installmentPlans: InstallmentPlan[]
): Transaction[] {
  const futureTransactions: Transaction[] = []
  const now = new Date()

  installmentPlans.forEach(plan => {
    if (plan.transactions.length === 0) return

    // Get the first installment date
    const firstInstallment = plan.transactions[0]
    const firstDate = new Date(firstInstallment.date + 'T00:00:00') // Add time to avoid timezone issues

    // Calculate how many installments have already been created
    const existingInstallments = plan.transactions.length
    const totalInstallments = plan.totalInstallments

    // Create future installments
    for (let i = existingInstallments; i < totalInstallments; i++) {
      const installmentDate = new Date(firstDate)
      installmentDate.setMonth(installmentDate.getMonth() + i)

      // Only include future installments (not past ones)
      if (installmentDate > now) {
        const futureTransaction: Transaction = {
          id: -(plan.id * 1000 + i + 1), // Negative ID to distinguish from real transactions
          dateTime: installmentDate.toISOString(),
          type: 'EXPENSE',
          category: firstInstallment.category,
          description: `${getInstallmentPlanTitle(firstInstallment.description)} (Installment ${i + 1}/${totalInstallments})`,
          amount: plan.installmentValue,
          paymentDate: installmentDate.toISOString().slice(0, 10),
          accountId: plan.accountId,
          accountName: plan.accountName,
          paymentMethodId: plan.paymentMethodId,
          paymentMethodName: plan.paymentMethodName,
          status: 'PLANNED',
          installmentPlanId: plan.id,
          installmentNumber: i + 1,
          isInstallment: true,
          // Add a flag to indicate this is a future installment
          isFutureInstallment: true
        }
        futureTransactions.push(futureTransaction)
      }
    }
  })

  return futureTransactions
}

/**
 * Merge real transactions with future installments
 * Sorts by date and combines both arrays
 */
export function mergeTransactionsWithFutureInstallments(
  realTransactions: Transaction[],
  installmentPlans: InstallmentPlan[]
): Transaction[] {
  const futureInstallments = calculateFutureInstallments(installmentPlans)
  
  // Normalize descriptions in real transactions
  const normalizedRealTransactions = realTransactions.map(tx => ({
    ...tx,
    description: normalizeInstallmentDescription(tx.description)
  }))
  
  // Combine and sort by date
  const allTransactions = [...normalizedRealTransactions, ...futureInstallments]
  return allTransactions.sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  )
}
