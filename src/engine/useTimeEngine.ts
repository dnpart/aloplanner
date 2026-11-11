import { useEffect } from 'react'
import { getBlock, listBlocksForDay, updateBlock } from '../db/blocks'
import { getSettings } from '../db/settings'
import type { Block } from '../db/types'
import { engineCopy } from '../content/timeCheck'
import { dayKey } from '../lib/dates'
import { encourage } from '../messages/encourage'
import { notify } from '../platform/notify'
import { completeBlock } from '../screens/today/blockActions'
import { useGuideStore } from '../state/guideStore'
import { useTimeCheck } from '../state/timeCheckStore'
import { planTick } from './plan'
import type { Alert } from './schedule'

const TICK_MS = 15_000

/**
 * Watches the clock while the app is open and interrupts at the right
 * moments: reminders, check-ins, the Time Check screen, the final warning,
 * and one nudge when a block ends unanswered. Mounted once in the shell.
 */
export function useTimeEngine() {
  useEffect(() => {
    let running = false
    const tick = async () => {
      if (running) return
      running = true
      try {
        await runTick(new Date())
      } finally {
        running = false
      }
    }
    void tick()
    const timer = window.setInterval(() => void tick(), TICK_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}

export async function runTick(now: Date): Promise<void> {
  const settings = await getSettings()
  if (!settings.onboarded) return
  const blocks = await listBlocksForDay(dayKey(now))
  const plan = planTick(blocks, now, settings.checkInMinutes)

  for (const [id, keys] of plan.markFired) {
    const block = await getBlock(id)
    if (block) await updateBlock(id, { alertsFired: [...new Set([...block.alertsFired, ...keys])] })
  }
  for (const id of plan.activate) await updateBlock(id, { status: 'active' })
  for (const { block, alert } of plan.fire) await fireAlert(block, alert)
}

async function fireAlert(block: Block, alert: Alert): Promise<void> {
  const title = block.title
  const n = engineCopy.notification
  const notification = (label: string) => ({ id: `${block.id}-${alert.key}`, title: label })

  switch (alert.kind) {
    case 'reminder': {
      const text = engineCopy.reminder(title, block.start)
      useGuideStore.getState().show({
        key: `${block.id}-${alert.key}`,
        character: 'owl',
        pose: 'neutral',
        tone: 'calm',
        text,
        sticky: true,
      })
      void notify({ id: `${block.id}-${alert.key}`, title: n.reminder, body: text })
      return
    }
    case 'check-in':
      await encourage('check-in', {
        vars: { title, minutes: alert.minutes },
        sticky: true,
        notification: notification(n.checkIn),
        actions: [
          { label: engineCopy.stillOnIt, onClick: () => undefined },
          { label: engineCopy.imDone, onClick: () => void completeBlock(block) },
        ],
      })
      return
    case 'wrap': {
      const shown = await encourage('wrap-up', {
        vars: { title },
        display: 'none',
        notification: notification(n.wrap),
      })
      useGuideStore.getState().dismiss()
      useTimeCheck.getState().open(block.id, shown?.text ?? '')
      return
    }
    case 'final': {
      // If the Time Check is still open, update it instead of stacking a bubble behind it.
      const timeCheckOpen = useTimeCheck.getState().blockId === block.id
      const shown = await encourage('final-warning', {
        vars: { title },
        sticky: true,
        display: timeCheckOpen ? 'none' : 'bubble',
        notification: notification(n.final),
      })
      if (timeCheckOpen && shown) useTimeCheck.getState().open(block.id, shown.text)
      return
    }
    case 'end':
      useTimeCheck.getState().close(block.id)
      await encourage('block-ended', {
        vars: { title },
        sticky: true,
        notification: notification(n.end),
      })
      return
  }
}
