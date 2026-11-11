import { isOpen } from '../db/blocks'
import type { Block } from '../db/types'
import { fromLocalISO } from '../lib/dates'
import { dueAlerts, missedAlerts, type Alert } from './schedule'

export type TickPlan = {
  /** Alerts to show now: at most one per block, the most recent. */
  fire: { block: Block; alert: Alert }[]
  /** Alert keys to record as fired (shown or skipped). */
  markFired: Map<string, string[]>
  /** Blocks that just started and should be marked active. */
  activate: string[]
}

/** Decides what the time engine should do at `now`. Pure, so it's easy to test. */
export function planTick(blocks: Block[], now: Date, checkInMinutes: number): TickPlan {
  const plan: TickPlan = { fire: [], markFired: new Map(), activate: [] }
  const t = now.getTime()
  for (const block of blocks) {
    if (!isOpen(block)) continue
    const due = dueAlerts(block, now, checkInMinutes)
    const missed = missedAlerts(block, now, checkInMinutes)
    const keys = [...due, ...missed].map((a) => a.key)
    if (keys.length) plan.markFired.set(block.id, keys)
    const latest = due[due.length - 1]
    if (latest) plan.fire.push({ block, alert: latest })
    const started =
      fromLocalISO(block.start).getTime() <= t && t < fromLocalISO(block.end).getTime()
    if (started && block.status === 'planned') plan.activate.push(block.id)
  }
  return plan
}
