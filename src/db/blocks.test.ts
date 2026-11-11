import { beforeEach, expect, test } from 'vitest'
import { resetDb } from '../test/db'
import {
  currentBlock,
  extendBlock,
  listBlocksForDay,
  newBlock,
  nextBlock,
  previousLeftOffNote,
  saveBlock,
} from './blocks'

beforeEach(resetDb)

const day = '2026-11-10'
const at = (time: string) => `${day}T${time}:00`
const make = (title: string, start: string, end: string, extra = {}) =>
  newBlock({ title, categoryId: 'commission', start: at(start), end: at(end), ...extra })

test('finds the current and next block', async () => {
  const a = make('Rig arm physics', '19:00', '20:00')
  const b = make('Post clip', '20:00', '20:15')
  const done = make('Edit clips', '18:00', '19:30', { status: 'done' })
  for (const x of [a, b, done]) await saveBlock(x)
  const blocks = await listBlocksForDay(day)
  const now = new Date(at('19:42'))
  expect(currentBlock(blocks, now)?.id).toBe(a.id)
  expect(nextBlock(blocks, now, a)?.id).toBe(b.id)
})

test('extending pushes the blocks after it, in a chain, and stops at a gap', async () => {
  const a = make('Rig', '19:00', '20:00')
  const b = make('Post clip', '20:00', '20:15')
  const c = make('Dinner', '20:15', '21:00')
  const d = make('Wind-down', '22:00', '23:00')
  for (const x of [a, b, c, d]) await saveBlock(x)

  const result = await extendBlock(a.id, 10)
  expect(result.block.end).toBe(at('20:10'))
  expect(result.block.extensionsUsed).toBe(1)
  expect(result.moved.map((m) => [m.title, m.start, m.end])).toEqual([
    ['Post clip', at('20:10'), at('20:25')],
    ['Dinner', at('20:25'), at('21:10')],
  ])
  expect(result.clash).toBeUndefined()
  const after = await listBlocksForDay(day)
  expect(after.find((x) => x.id === d.id)?.start).toBe(at('22:00'))
})

test('appointments never move; the clash is reported', async () => {
  const a = make('Rig', '15:00', '16:00')
  const call = make('Client call', '16:00', '16:30', { kind: 'appointment' })
  for (const x of [a, call]) await saveBlock(x)
  const result = await extendBlock(a.id, 10)
  expect(result.moved).toEqual([])
  expect(result.clash?.id).toBe(call.id)
})

test('extending clears warnings so they fire again for the new end', async () => {
  const a = make('Rig', '19:00', '20:00', { alertsFired: ['checkin-20', 'wrap', 'final'] })
  await saveBlock(a)
  const { block } = await extendBlock(a.id, 10)
  expect(block.alertsFired).toEqual(['checkin-20'])
})

test('shows the last "where I left off" note from the same task', async () => {
  const earlier = make('Rig', '10:00', '11:00', { taskId: 't1', leftOffNote: 'Left arm done' })
  const other = make('Rig', '12:00', '13:00', { taskId: 't2', leftOffNote: 'Other job' })
  const now = make('Rig', '19:00', '20:00', { taskId: 't1' })
  for (const x of [earlier, other, now]) await saveBlock(x)
  expect((await previousLeftOffNote(now))?.leftOffNote).toBe('Left arm done')
})
