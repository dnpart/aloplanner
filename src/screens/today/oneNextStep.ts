import { overwhelmCopy } from '../../content/overwhelm'
import { nextStep } from '../../db/tasks'
import type { Block, Task } from '../../db/types'

/**
 * The single thing to look at in "Too much" mode: the current task's next
 * step, else the first unfinished Top 3 item, else the next block.
 */
export function oneNextStep(
  currentTask: Task | undefined,
  topThree: Task[],
  next: Block | undefined,
): string | undefined {
  const step = currentTask && !currentTask.done ? nextStep(currentTask) : undefined
  if (step) return step.text
  const top = topThree.find((t) => !t.done && t.id !== currentTask?.id)
  if (top) return nextStep(top)?.text ?? top.title
  if (next) return overwhelmCopy.blockAt(next.title, next.start)
  return undefined
}
