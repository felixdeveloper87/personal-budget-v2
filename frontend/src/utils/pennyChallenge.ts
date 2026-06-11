import type { SavingsGoal } from '../types'

// The "penny-a-day" challenge: save £0.01 on day 1 of the year, £0.02 on day 2,
// … up to £3.65 (or £3.66 in a leap year) on the last day. The schedule is fully
// determined by the calendar, so everything here is computed on the client — no
// backend storage is needed beyond the goal's running total.

export const CHALLENGE_NAME_PREFIX = 'Penny-a-day Challenge'

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

/** 1-based day of the year for a local date (Jan 1 → 1). */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diffDays = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
  return diffDays + 1
}

/** Round to whole pennies to avoid floating-point drift. */
function toMoney(value: number): number {
  return Math.round(value * 100) / 100
}

/** Amount to save on day N (1-based): £N/100. */
export function dailyAmount(day: number): number {
  return toMoney(day / 100)
}

/** Cumulative expected total by the end of day N: sum(1..N)/100. */
export function cumulativeByDay(day: number): number {
  return toMoney((day * (day + 1)) / 2 / 100)
}

/** Full-year target for the challenge (£667.95 in a 365-day year). */
export function challengeYearTotal(year: number): number {
  return cumulativeByDay(daysInYear(year))
}

/**
 * Expected cumulative amount that should be saved by `today`, relative to the
 * challenge `year`. Before the year → 0; after it → the full total.
 */
export function expectedCumulativeToday(year: number, today: Date = new Date()): number {
  const ty = today.getFullYear()
  if (ty < year) return 0
  if (ty > year) return challengeYearTotal(year)
  const day = Math.min(dayOfYear(today), daysInYear(year))
  return cumulativeByDay(day)
}

export function isPennyChallengeGoal(goal: Pick<SavingsGoal, 'name'>): boolean {
  return goal.name.startsWith(CHALLENGE_NAME_PREFIX)
}

/** The challenge year, derived from the goal's target date (Dec 31 of the year). */
export function challengeYearOf(goal: Pick<SavingsGoal, 'targetDate'>): number {
  if (goal.targetDate) {
    const year = Number(goal.targetDate.slice(0, 4))
    if (Number.isFinite(year)) return year
  }
  return new Date().getFullYear()
}

export interface ChallengeStatus {
  year: number
  /** 1-based day of the year for today, clamped to the challenge window. */
  todayDay: number
  /** Amount due specifically for today (£todayDay/100), or 0 if outside the year. */
  todayAmount: number
  /** Cumulative amount that should be saved by today. */
  expectedByToday: number
  /** What the goal currently holds. */
  saved: number
  /** Full-year target. */
  total: number
  /** expectedByToday − saved. Positive → behind, negative → ahead. */
  catchUp: number
  daysInYear: number
  /** Whether the challenge year has fully elapsed. */
  finished: boolean
}

export function getChallengeStatus(goal: SavingsGoal, today: Date = new Date()): ChallengeStatus {
  const year = challengeYearOf(goal)
  const dim = daysInYear(year)
  const ty = today.getFullYear()

  const todayDay = ty === year ? Math.min(dayOfYear(today), dim) : ty > year ? dim : 0
  const withinYear = ty === year
  const expectedByToday = expectedCumulativeToday(year, today)
  const saved = goal.currentAmount
  const total = challengeYearTotal(year)

  return {
    year,
    todayDay,
    todayAmount: withinYear ? dailyAmount(todayDay) : 0,
    expectedByToday,
    saved,
    total,
    catchUp: toMoney(expectedByToday - saved),
    daysInYear: dim,
    finished: ty > year,
  }
}
