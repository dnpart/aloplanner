import { newId, toLocalISO, toLocalISOPrecise } from '../lib/dates'
import { db } from './db'
import type { Task, TaskStep } from './types'

export const TOP_THREE_LIMIT = 3

export async function addTask(title: string, categoryId = 'life', now = new Date()): Promise<Task> {
  const task: Task = {
    id: newId(),
    title: title.trim(),
    categoryId,
    someday: true,
    steps: [],
    done: false,
    createdAt: toLocalISOPrecise(now),
  }
  await db.tasks.add(task)
  return task
}

export function getTask(id: string) {
  return db.tasks.get(id)
}

export async function listTasks(): Promise<Task[]> {
  return (await db.tasks.toArray()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function listTopThree(day: string): Promise<Task[]> {
  const rows = await db.tasks.where('topThreeDate').equals(day).toArray()
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** Open tasks that aren't in today's Top 3. */
export function somedayTasks(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => !t.done && t.topThreeDate !== day)
}

export async function updateTask(id: string, patch: Partial<Omit<Task, 'id'>>): Promise<void> {
  await db.tasks.update(id, patch)
}

/** Puts a task in a day's Top 3. Returns false if that day is full. */
export async function addToTopThree(id: string, day: string): Promise<boolean> {
  return db.transaction('rw', db.tasks, async () => {
    const count = await db.tasks.where('topThreeDate').equals(day).count()
    if (count >= TOP_THREE_LIMIT) return false
    await db.tasks.update(id, { topThreeDate: day, someday: false })
    return true
  })
}

export async function removeFromTopThree(id: string): Promise<void> {
  await db.tasks.update(id, { topThreeDate: undefined, someday: true })
}

export async function setTaskDone(id: string, done: boolean, now = new Date()): Promise<void> {
  await db.tasks.update(id, { done, doneAt: done ? toLocalISO(now) : undefined })
}

export async function deleteTask(id: string): Promise<void> {
  await db.transaction('rw', db.tasks, db.blocks, async () => {
    await db.tasks.delete(id)
    // Keep the blocks, just unlink them.
    await db.blocks
      .where('taskId')
      .equals(id)
      .modify((b) => {
        delete b.taskId
      })
  })
}

export function nextStep(task: Task): TaskStep | undefined {
  return task.steps.find((s) => !s.done)
}

export async function addStep(taskId: string, text: string): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(taskId)
    if (!task) return
    const step: TaskStep = { id: newId(), text: text.trim(), done: false }
    await db.tasks.update(taskId, { steps: [...task.steps, step] })
  })
}

export async function updateStep(
  taskId: string,
  stepId: string,
  patch: Partial<Omit<TaskStep, 'id'>>,
): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(taskId)
    if (!task) return
    await db.tasks.update(taskId, {
      steps: task.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    })
  })
}

export async function deleteStep(taskId: string, stepId: string): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(taskId)
    if (!task) return
    await db.tasks.update(taskId, { steps: task.steps.filter((s) => s.id !== stepId) })
  })
}
