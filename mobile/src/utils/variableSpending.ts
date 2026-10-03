import type { Transaction } from "../types/finance";

export function isExpensePaceTransaction(transaction: Transaction) {
  return !(
    transaction.isInstallment ||
    transaction.installmentPlanId != null ||
    transaction.isRecurring ||
    transaction.recurringTransactionId != null
  );
}

export function getVariableSpending(transactions: Transaction[], date: Date) {
  const elapsedDays = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  let totalCents = 0;

  for (const transaction of transactions) {
    if (transaction.type !== "EXPENSE" || transaction.status === "PLANNED" || !isExpensePaceTransaction(transaction)) continue;
    const source = transaction.transactionDate ?? transaction.dateTime;
    // Date-only values represent a local calendar date, not midnight UTC.
    const occurred = source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source);
    if (
      occurred.getFullYear() !== date.getFullYear() ||
      occurred.getMonth() !== date.getMonth() ||
      occurred.getDate() > elapsedDays
    ) continue;
    const amount = Number(transaction.amount);
    if (Number.isFinite(amount)) totalCents += Math.round(amount * 100);
  }

  const spent = totalCents / 100;
  const dailyAverage = spent / elapsedDays;
  const projection = dailyAverage * daysInMonth;
  return {
    spent,
    dailyAverage,
    projection,
    elapsedDays,
    daysInMonth,
    share: projection > 0 ? Math.min(1, Math.max(0, spent / projection)) : 0,
  };
}
