import { format } from 'date-fns'
import { fromLocalISO } from './dates'

export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? fromLocalISO(value) : value
  return format(d, 'h:mm a')
}

/** "7:00–8:00 PM", or "11:00 AM–1:00 PM" across noon. */
export function formatTimeRange(start: string, end: string): string {
  const s = fromLocalISO(start)
  const e = fromLocalISO(end)
  if (format(s, 'a') === format(e, 'a')) return `${format(s, 'h:mm')}–${format(e, 'h:mm a')}`
  return `${format(s, 'h:mm a')}–${format(e, 'h:mm a')}`
}

export function formatDuration(minutes: number): string {
  const m = Math.round(minutes)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} hr ${r} min` : `${h} hr`
}
