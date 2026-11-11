import { expect, test } from 'vitest'
import { newBlock } from '../db/blocks'
import { blockAlerts, dueAlerts, missedAlerts, nextCheckIn } from './schedule'

const block = (start: string, end: string, extra = {}) =>
  newBlock({
    title: 'Rig',
    categoryId: 'commission',
    start: `2026-11-10T${start}:00`,
    end: `2026-11-10T${end}:00`,
    ...extra,
  })
const at = (time: string) => new Date(`2026-11-10T${time}:00`)
const keys = (b: ReturnType<typeof block>) => blockAlerts(b, 20).map((a) => a.key)

test('a one-hour block: check-ins every 20 min until 15 min before the end, then wrap, final, end', () => {
  expect(keys(block('19:00', '20:00'))).toEqual([
    'checkin-20',
    'checkin-40',
    'wrap',
    'final',
    'end',
  ])
})

test('a two-hour block gets more check-ins', () => {
  expect(keys(block('19:00', '21:00'))).toEqual([
    'checkin-20',
    'checkin-40',
    'checkin-60',
    'checkin-80',
    'checkin-100',
    'wrap',
    'final',
    'end',
  ])
})

test('check-ins can be turned off for one block', () => {
  expect(keys(block('19:00', '20:00', { checkIns: false }))).toEqual(['wrap', 'final', 'end'])
})

test('short blocks skip the Time Check screen', () => {
  expect(keys(block('20:00', '20:15'))).toEqual(['final', 'end'])
})

test('reminders come before the start', () => {
  expect(blockAlerts(block('19:00', '20:00', { reminders: [10] }), 20)[0]).toMatchObject({
    key: 'reminder-10',
    at: at('18:50'),
  })
})

test('an alert is due once, inside its window', () => {
  const b = block('19:00', '20:00')
  expect(dueAlerts(b, at('19:20'), 20).map((a) => a.key)).toEqual(['checkin-20'])
  expect(dueAlerts({ ...b, alertsFired: ['checkin-20'] }, at('19:21'), 20)).toEqual([])
  // Too late for that check-in.
  expect(dueAlerts(b, at('19:30'), 20)).toEqual([])
  expect(missedAlerts(b, at('19:30'), 20).map((a) => a.key)).toEqual(['checkin-20'])
})

test('opening the app with 6 minutes left still shows the Time Check', () => {
  expect(dueAlerts(block('19:00', '20:00'), at('19:54'), 20).map((a) => a.key)).toEqual(['wrap'])
})

test('next check-in time', () => {
  expect(nextCheckIn(block('19:00', '20:00'), at('19:42'), 20)).toBeUndefined()
  expect(nextCheckIn(block('19:00', '21:00'), at('19:42'), 20)).toEqual(at('20:00'))
})
