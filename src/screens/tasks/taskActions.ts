import { listTopThree, setTaskDone } from '../../db/tasks'
import type { Task } from '../../db/types'
import { dayKey } from '../../lib/dates'
import { encourage } from '../../messages/encourage'

/** Checks a task off (or back on). Finishing the whole Top 3 is a big win. */
export async function toggleTask(task: Task, done: boolean): Promise<void> {
  await setTaskDone(task.id, done)
  if (!done) return
  const today = dayKey(new Date())
  const top = await listTopThree(today)
  if (task.topThreeDate === today && top.length === 3 && top.every((t) => t.done)) {
    await encourage('top3-done')
  } else {
    await encourage('task-done', { vars: { title: task.title } })
  }
}
