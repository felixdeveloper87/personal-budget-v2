import type { Transaction } from "../types/finance";

function sumThroughDay(transactions: Transaction[], type: Transaction["type"], year: number, month: number, lastDay: number) {
  let totalCents = 0;

  for (const transaction of transactions) {
    if (transaction.type !== type || transaction.status === "PLANNED") continue;
    const source = transaction.transactionDate ?? transaction.dateTime;
    // Date-only values represent a local calendar date, not midnight UTC.
    const occurred = source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source);
    if (
      occurred.getFullYear() !== year ||
      occurred.getMonth() !== month ||
      occurred.getDate() > lastDay
    ) continue;
    const amount = Number(transaction.amount);
    if (Number.isFinite(amount)) totalCents += Math.round(amount * 100);
  }

  return totalCents / 100;
}

/**
 * Like-for-like totals: day 1..N of this month vs day 1..N of last month.
 * N is clamped to last month's length (e.g. 31 March compares with 1–28 February).
 */
export function getMonthToDateComparison(transactions: Transaction[], type: Transaction["type"], date: Date) {
  const day = date.getDate();
  const previousYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
  const previousMonth = (date.getMonth() + 11) % 12;
  const previousDays = new Date(previousYear, previousMonth + 1, 0).getDate();

  return {
    current: sumThroughDay(transactions, type, date.getFullYear(), date.getMonth(), day),
    previous: sumThroughDay(transactions, type, previousYear, previousMonth, Math.min(day, previousDays)),
  };
}
