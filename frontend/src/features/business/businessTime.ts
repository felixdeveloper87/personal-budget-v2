import type { WorkSession } from '../../types'

const pad = (value: number) => String(value).padStart(2, '0')

/** Local calendar day as yyyy-mm-dd (never UTC, so late-evening work stays on its day). */
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Local time as HH:mm, for <input type="time">. */
export function localTimeKey(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Joins a yyyy-mm-dd day and an HH:mm time in the user's timezone. */
export function combineLocal(dateKey: string, timeKey: string, addDays = 0): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hours, minutes] = timeKey.split(':').map(Number)
  return new Date(year, month - 1, day + addDays, hours, minutes, 0, 0)
}

/** 3725 → "01:02:05", for the live timer. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`
}

/** 3725 → "1h 02m"; 600 → "10m". */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.max(0, Math.round(totalSeconds / 60))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours}h ${pad(rest)}m` : `${rest}m`
}

/** Seconds worked right now, given when the session data was fetched. */
export function liveWorkedSeconds(session: WorkSession, fetchedAt: number, now: number): number {
  if (session.status !== 'RUNNING') return session.workedSeconds
  return session.workedSeconds + Math.max(0, (now - fetchedAt) / 1000)
}

/** Monday..Sunday of the week containing `date`, as day keys. */
export function weekRange(date: Date): { from: string; to: string } {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  return { from: localDateKey(monday), to: localDateKey(sunday) }
}

/** First..last day of the month containing `date`, as day keys. */
export function monthRange(date: Date): { from: string; to: string } {
  return {
    from: localDateKey(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: localDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  }
}

/** yyyy-mm-dd → Date at local midnight (avoids the UTC shift of `new Date('yyyy-mm-dd')`). */
export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
