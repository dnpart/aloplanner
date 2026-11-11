import { beforeEach, expect, test } from 'vitest'
import { resetDb } from '../test/db'
import { newBlock, saveBlock, getBlock } from './blocks'
import {
  addStep,
  addTask,
  addToTopThree,
  deleteTask,
  getTask,
  listTasks,
  listTopThree,
  nextStep,
  removeFromTopThree,
  somedayTasks,
  updateStep,
} from './tasks'

beforeEach(resetDb)
const day = '2026-11-10'

test('Top 3 holds at most three tasks; the rest stay in Someday', async () => {
  const tasks = []
  let ms = 0
  for (const t of ['A', 'B', 'C', 'D'])
    tasks.push(await addTask(t, 'life', new Date(2026, 10, 10, 9, 0, 0, ms++)))
  for (const t of tasks.slice(0, 3)) expect(await addToTopThree(t.id, day)).toBe(true)
  expect(await addToTopThree(tasks[3]!.id, day)).toBe(false)
  expect((await listTopThree(day)).map((t) => t.title)).toEqual(['A', 'B', 'C'])
  expect(somedayTasks(await listTasks(), day).map((t) => t.title)).toEqual(['D'])

  await removeFromTopThree(tasks[0]!.id)
  expect((await listTopThree(day)).map((t) => t.title)).toEqual(['B', 'C'])
  expect((await getTask(tasks[0]!.id))?.someday).toBe(true)
})

test('yesterday’s Top 3 goes back to Someday on a new day', async () => {
  const t = await addTask('A')
  await addToTopThree(t.id, '2026-11-09')
  expect(somedayTasks(await listTasks(), day).map((x) => x.title)).toEqual(['A'])
})

test('the next step is the first unchecked one', async () => {
  const t = await addTask('Rig model')
  await addStep(t.id, 'Face')
  await addStep(t.id, 'Body')
  let task = await getTask(t.id)
  await updateStep(t.id, task!.steps[0]!.id, { done: true })
  task = await getTask(t.id)
  expect(nextStep(task!)?.text).toBe('Body')
})

test('deleting a task keeps its blocks but unlinks them', async () => {
  const t = await addTask('Rig model')
  const b = newBlock({
    title: 'Rig',
    categoryId: 'commission',
    start: `${day}T10:00:00`,
    end: `${day}T11:00:00`,
    taskId: t.id,
  })
  await saveBlock(b)
  await deleteTask(t.id)
  const after = await getBlock(b.id)
  expect(after).toBeDefined()
  expect(after?.taskId).toBeUndefined()
})
