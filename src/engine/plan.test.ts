import { expect, test } from 'vitest'
import { newBlock } from '../db/blocks'
import { planTick } from './plan'

const at = (time: string) => new Date(`2026-11-10T${time}:00`)
const block = (title: string, start: string, end: string, extra = {}) =>
  newBlock({
    title,
    categoryId: 'commission',
    start: `2026-11-10T${start}:00`,
    end: `2026-11-10T${end}:00`,
    ...extra,
  })

test('fires the check-in and marks the block active', () => {
  const b = block('Rig', '19:00', '20:00')
  const plan = planTick([b], at('19:20'), 20)
  expect(plan.fire.map((f) => f.alert.key)).toEqual(['checkin-20'])
  expect(plan.markFired.get(b.id)).toEqual(['checkin-20'])
  expect(plan.activate).toEqual([b.id])
})

test('after a long sleep, only the latest alert shows and older ones are skipped', () => {
  const b = block('Rig', '19:00', '20:00', { status: 'active' })
  const plan = planTick([b], at('19:52'), 20)
  expect(plan.fire.map((f) => f.alert.key)).toEqual(['wrap'])
  expect(plan.markFired.get(b.id)?.sort()).toEqual(['checkin-20', 'checkin-40', 'wrap'].sort())
})

test('a block that ends unanswered nudges once; a done block never does', () => {
  const open = block('Rig', '19:00', '20:00', {
    status: 'active',
    alertsFired: ['checkin-20', 'checkin-40', 'wrap', 'final'],
  })
  const done = block('Edit', '19:00', '20:00', { status: 'done' })
  const plan = planTick([open, done], at('20:01'), 20)
  expect(plan.fire.map((f) => [f.block.title, f.alert.key])).toEqual([['Rig', 'end']])
  const again = planTick([{ ...open, alertsFired: [...open.alertsFired, 'end'] }], at('20:03'), 20)
  expect(again.fire).toEqual([])
})
