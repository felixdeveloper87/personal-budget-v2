import type { PeriodType, Transaction } from '../../../../types'

/**
 * A single bar slot in a period-bucket chart.
 *
 * `key`   — stable React key (unique per slot).
 * `label` — short tick label rendered under the bar (e.g. "M", "12p", "5", "J").
 *           For dense periods (month) this can be empty for hidden ticks.
 * `value` — aggregated transaction amount for the slot.
 * `tooltip` — full label shown in the tooltip ("Mon", "Apr 12", "January").
 */
export interface PeriodBucket {
  key: string
  label: string
  tooltip: string
  value: number
  income: number
  expense: number
  transactions: Transaction[]
}

export type PeriodFilter = 'INCOME' | 'EXPENSE' | 'ALL'

const DAY_BLOCKS: ReadonlyArray<{ start: number; end: number; label: string; tooltip: string }> = [
  { start: 0, end: 4, label: '12a', tooltip: '12am – 4am' },
  { start: 4, end: 8, label: '4a', tooltip: '4am – 8am' },
  { start: 8, end: 12, label: '8a', tooltip: '8am – 12pm' },
  { start: 12, end: 16, label: '12p', tooltip: '12pm – 4pm' },
  { start: 16, end: 20, label: '4p', tooltip: '4pm – 8pm' },
  { start: 20, end: 24, label: '8p', tooltip: '8pm – 12am' },
]

const WEEK_LABELS: ReadonlyArray<{ short: string; long: string }> = [
  { short: 'M', long: 'Monday' },
  { short: 'T', long: 'Tuesday' },
  { short: 'W', long: 'Wednesday' },
  { short: 'T', long: 'Thursday' },
  { short: 'F', long: 'Friday' },
  { short: 'S', long: 'Saturday' },
  { short: 'S', long: 'Sunday' },
]

const MONTH_LABELS: ReadonlyArray<{ short: string; long: string }> = [
  { short: 'J', long: 'January' },
  { short: 'F', long: 'February' },
  { short: 'M', long: 'March' },
  { short: 'A', long: 'April' },
  { short: 'M', long: 'May' },
  { short: 'J', long: 'June' },
  { short: 'J', long: 'July' },
  { short: 'A', long: 'August' },
  { short: 'S', long: 'September' },
  { short: 'O', long: 'October' },
  { short: 'N', long: 'November' },
  { short: 'D', long: 'December' },
]

function applyFilter(transactions: Transaction[], filter: PeriodFilter): Transaction[] {
  if (filter === 'ALL') return transactions
  return transactions.filter((t) => t.type === filter)
}

function competenceDate(tx: Transaction): Date {
  const source = tx.paymentDate || tx.transactionDate || tx.dateTime
  return source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source)
}

function addTransactionToBucket(bucket: PeriodBucket, transaction: Transaction): void {
  bucket.value += transaction.amount
  bucket.transactions.push(transaction)

  if (transaction.type === 'INCOME') {
    bucket.income += transaction.amount
  } else {
    bucket.expense += transaction.amount
  }
}

function bucketByHourBlocks(txs: Transaction[], selectedDate: Date): PeriodBucket[] {
  const buckets: PeriodBucket[] = DAY_BLOCKS.map((b, i) => ({
    key: `h${i}`,
    label: b.label,
    tooltip: b.tooltip,
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
  }))
  const y = selectedDate.getFullYear()
  const m = selectedDate.getMonth()
  const d = selectedDate.getDate()

  for (const tx of txs) {
    const txDate = competenceDate(tx)
    if (
      txDate.getFullYear() !== y ||
      txDate.getMonth() !== m ||
      txDate.getDate() !== d
    ) {
      continue
    }
    const hour = txDate.getHours()
    const idx = DAY_BLOCKS.findIndex((b) => hour >= b.start && hour < b.end)
    if (idx >= 0) addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByDayOfWeek(txs: Transaction[], selectedDate: Date): PeriodBucket[] {
  const buckets: PeriodBucket[] = WEEK_LABELS.map((w, i) => ({
    key: `d${i}`,
    label: w.short,
    tooltip: w.long,
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
  }))

  // Monday-first week: shift selectedDate to start of its ISO week.
  const start = new Date(selectedDate)
  start.setHours(0, 0, 0, 0)
  const dow = start.getDay()
  const shift = dow === 0 ? -6 : 1 - dow
  start.setDate(start.getDate() + shift)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  for (const tx of txs) {
    const txDate = competenceDate(tx)
    if (txDate < start || txDate >= end) continue
    const dayOfWeek = txDate.getDay()
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByDayOfMonth(txs: Transaction[], selectedDate: Date): PeriodBucket[] {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = MONTH_LABELS[month].long

  // Reduce label clutter on small screens: only show every 5th day plus the
  // first and last. The other ticks are still rendered (so the chart aligns
  // perfectly with the underlying data) but with empty label strings.
  const buckets: PeriodBucket[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const showLabel = day === 1 || day === daysInMonth || day % 5 === 0
    return {
      key: `m${day}`,
      label: showLabel ? String(day) : '',
      tooltip: `${monthName} ${day}`,
      value: 0,
      income: 0,
      expense: 0,
      transactions: [],
    }
  })

  for (const tx of txs) {
    const txDate = competenceDate(tx)
    if (txDate.getFullYear() !== year || txDate.getMonth() !== month) continue
    const idx = txDate.getDate() - 1
    if (idx >= 0 && idx < daysInMonth) addTransactionToBucket(buckets[idx], tx)
  }
  return buckets
}

function bucketByMonthOfYear(txs: Transaction[], selectedDate: Date): PeriodBucket[] {
  const year = selectedDate.getFullYear()
  const buckets: PeriodBucket[] = MONTH_LABELS.map((m, i) => ({
    key: `mo${i}`,
    label: m.short,
    tooltip: `${m.long} ${year}`,
    value: 0,
    income: 0,
    expense: 0,
    transactions: [],
  }))
  for (const tx of txs) {
    const txDate = competenceDate(tx)
    if (txDate.getFullYear() !== year) continue
    addTransactionToBucket(buckets[txDate.getMonth()], tx)
  }
  return buckets
}

/**
 * Aggregate transactions into a fixed-shape series of "buckets" tailored to
 * the active period:
 *
 *  - **day**   → 6 four-hour slots (12a / 4a / 8a / 12p / 4p / 8p)
 *  - **week**  → 7 days, Monday first (M T W T F S S)
 *  - **month** → N day slots, where N is the number of days in the month;
 *                only every 5th tick is labelled to avoid crowding
 *  - **year**  → 12 months (J F M A M J J A S O N D)
 *
 * The output is always a contiguous array (never sparse) so the chart
 * preserves a consistent silhouette even when there is no data for some
 * slots — an important visual cue.
 */
export function bucketTransactionsByPeriod(
  transactions: Transaction[],
  periodType: PeriodType,
  selectedDate: Date,
  filter: PeriodFilter = 'ALL',
): PeriodBucket[] {
  const filtered = applyFilter(transactions, filter)
  switch (periodType) {
    case 'day':
      return bucketByHourBlocks(filtered, selectedDate)
    case 'week':
      return bucketByDayOfWeek(filtered, selectedDate)
    case 'month':
      return bucketByDayOfMonth(filtered, selectedDate)
    case 'year':
      return bucketByMonthOfYear(filtered, selectedDate)
    default:
      return []
  }
}

/**
 * Short, friendly title for the bar-chart card.
 * Examples: "TODAY", "THIS WEEK", "APRIL 2026", "2026".
 */
export function getPeriodHeadline(
  periodType: PeriodType,
  selectedDate: Date,
): string {
  const today = new Date()
  const sameDay =
    today.getFullYear() === selectedDate.getFullYear() &&
    today.getMonth() === selectedDate.getMonth() &&
    today.getDate() === selectedDate.getDate()

  switch (periodType) {
    case 'day':
      return sameDay
        ? 'TODAY'
        : selectedDate
            .toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
            .toUpperCase()
    case 'week': {
      const ref = new Date()
      const refStart = new Date(ref)
      refStart.setHours(0, 0, 0, 0)
      const dow = refStart.getDay()
      refStart.setDate(refStart.getDate() + (dow === 0 ? -6 : 1 - dow))
      const selStart = new Date(selectedDate)
      selStart.setHours(0, 0, 0, 0)
      const sDow = selStart.getDay()
      selStart.setDate(selStart.getDate() + (sDow === 0 ? -6 : 1 - sDow))
      return refStart.getTime() === selStart.getTime()
        ? 'THIS WEEK'
        : 'WEEK'
    }
    case 'month':
      return selectedDate
        .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        .toUpperCase()
    case 'year':
      return selectedDate.getFullYear().toString()
    default:
      return ''
  }
}
