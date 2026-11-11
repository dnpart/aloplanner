import type { Block } from '../db/types'
import { fromLocalISO } from '../lib/dates'

export type AlertKind = 'reminder' | 'check-in' | 'wrap' | 'final' | 'end'

export type Alert = {
  /** Stored in block.alertsFired so it fires once. */
  key: string
  kind: AlertKind
  at: Date
  /** Minutes since start (check-ins) or before start (reminders). */
  minutes?: number
}

const MIN = 60_000

/** Minutes before the end when the Time Check screen appears. */
export const WRAP_MINUTES = 10
export const FINAL_MINUTES = 2

/** How late an alert may still fire, e.g. after the app was in the background. */
const GRACE: Record<AlertKind, number> = {
  reminder: 5 * MIN,
  'check-in': 3 * MIN,
  // Still worth showing the Time Check until the final warning takes over.
  wrap: (WRAP_MINUTES - FINAL_MINUTES) * MIN,
  final: FINAL_MINUTES * MIN,
  end: 10 * MIN,
}

/** Every alert a block will produce, in time order. */
export function blockAlerts(block: Block, checkInMinutes: number): Alert[] {
  const start = fromLocalISO(block.start).getTime()
  const end = fromLocalISO(block.end).getTime()
  const duration = (end - start) / MIN
  const alerts: Alert[] = []

  for (const r of block.reminders) {
    if (r > 0)
      alerts.push({
        key: `reminder-${r}`,
        kind: 'reminder',
        at: new Date(start - r * MIN),
        minutes: r,
      })
  }
  // Check-ins only in long blocks, and never in the last 15 minutes (wrap-up covers that).
  if (block.checkIns && checkInMinutes > 0) {
    for (
      let t = checkInMinutes;
      start + t * MIN <= end - (WRAP_MINUTES + 5) * MIN;
      t += checkInMinutes
    ) {
      alerts.push({
        key: `checkin-${t}`,
        kind: 'check-in',
        at: new Date(start + t * MIN),
        minutes: t,
      })
    }
  }
  if (duration > 15)
    alerts.push({ key: 'wrap', kind: 'wrap', at: new Date(end - WRAP_MINUTES * MIN) })
  if (duration > 4)
    alerts.push({ key: 'final', kind: 'final', at: new Date(end - FINAL_MINUTES * MIN) })
  alerts.push({ key: 'end', kind: 'end', at: new Date(end) })
  return alerts.sort((a, b) => a.at.getTime() - b.at.getTime())
}

/**
 * Alerts that should fire now and haven't yet. When several are due at once
 * (the app was asleep), only the most recent one matters, so callers fire
 * the last and mark the rest as fired.
 */
export function dueAlerts(block: Block, now: Date, checkInMinutes: number): Alert[] {
  const t = now.getTime()
  return blockAlerts(block, checkInMinutes).filter(
    (a) =>
      !block.alertsFired.includes(a.key) &&
      a.at.getTime() <= t &&
      t < a.at.getTime() + GRACE[a.kind],
  )
}

/** Alerts that were skipped because their window passed; mark them fired too. */
export function missedAlerts(block: Block, now: Date, checkInMinutes: number): Alert[] {
  const t = now.getTime()
  return blockAlerts(block, checkInMinutes).filter(
    (a) => !block.alertsFired.includes(a.key) && t >= a.at.getTime() + GRACE[a.kind],
  )
}

export function nextCheckIn(block: Block, now: Date, checkInMinutes: number): Date | undefined {
  return blockAlerts(block, checkInMinutes).find(
    (a) => a.kind === 'check-in' && a.at.getTime() > now.getTime(),
  )?.at
}
