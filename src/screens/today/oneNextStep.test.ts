import { expect, test } from 'vitest'
import { newBlock } from '../../db/blocks'
import type { Task } from '../../db/types'
import { oneNextStep } from './oneNextStep'

const task = (title: string, extra: Partial<Task> = {}): Task => ({
  id: title,
  title,
  categoryId: 'life',
  someday: false,
  steps: [],
  done: false,
  createdAt: '',
  ...extra,
})
const next = newBlock({
  title: 'Post clip',
  categoryId: 'stream',
  start: '2026-11-10T20:00:00',
  end: '2026-11-10T20:15:00',
})

test('prefers the current task’s next step, then the Top 3, then the next block', () => {
  const rig = task('Rig', { steps: [{ id: 's', text: 'Right arm', done: false }] })
  expect(oneNextStep(rig, [], next)).toBe('Right arm')
  expect(oneNextStep(undefined, [task('A', { done: true }), task('Reply to client')], next)).toBe(
    'Reply to client',
  )
  expect(oneNextStep(undefined, [], next)).toBe('Post clip at 8:00 PM')
  expect(oneNextStep(undefined, [], undefined)).toBeUndefined()
})
