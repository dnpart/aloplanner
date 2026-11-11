import { addDays, format, parseISO, startOfDay } from 'date-fns'

/**
 * Stored dates are ISO strings in local time with no offset,
 * e.g. "2026-11-11T19:30:00". Days are "2026-11-11".
 */
export function toLocalISO(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss")
}

/** Like toLocalISO with milliseconds, for "created at" ordering. */
export function toLocalISOPrecise(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS")
}

export function fromLocalISO(value: string): Date {
  return parseISO(value)
}

export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function dayBounds(day: string): { start: string; end: string } {
  const start = startOfDay(parseISO(day))
  return { start: toLocalISO(start), end: toLocalISO(addDays(start, 1)) }
}

export function minutesBetween(a: string | Date, b: string | Date): number {
  const ta = typeof a === 'string' ? fromLocalISO(a).getTime() : a.getTime()
  const tb = typeof b === 'string' ? fromLocalISO(b).getTime() : b.getTime()
  return (tb - ta) / 60_000
}

export function addMinutesISO(value: string, minutes: number): string {
  return toLocalISO(new Date(fromLocalISO(value).getTime() + minutes * 60_000))
}

export function newId(): string {
  return crypto.randomUUID()
}
