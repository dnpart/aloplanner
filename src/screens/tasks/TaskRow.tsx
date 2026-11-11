import { useId, type ReactNode } from 'react'
import { ChevronIcon } from '../../components/icons'
import { tasksCopy as copy } from '../../content/tasks'
import { nextStep } from '../../db/tasks'
import type { Task } from '../../db/types'
import { useTaskSheet } from '../../state/taskSheetStore'
import { toggleTask } from './taskActions'

/** A task with a big checkbox. Done tasks are dimmed with a check, never struck through. */
export function TaskRow({ task, children }: { task: Task; children?: ReactNode }) {
  const id = useId()
  const open = useTaskSheet((s) => s.open)
  const step = nextStep(task)
  const doneSteps = task.steps.filter((s) => s.done).length

  return (
    <li className={`task-row${task.done ? ' is-done' : ''}`}>
      <input
        id={id}
        type="checkbox"
        checked={task.done}
        onChange={(e) => void toggleTask(task, e.target.checked)}
      />
      <div className="task-row__body">
        <label htmlFor={id} className="task-row__title">
          {task.title}
        </label>
        {!task.done && step && (
          <p className="secondary">
            {copy.nextStep}: {step.text}
          </p>
        )}
        {!task.done && task.steps.length > 0 && !step && (
          <p className="secondary">{copy.steps(doneSteps, task.steps.length)}</p>
        )}
        {children && <div className="task-row__extra">{children}</div>}
      </div>
      <div className="task-row__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={copy.openTask(task.title)}
          onClick={() => open(task.id)}
        >
          <ChevronIcon />
        </button>
      </div>
    </li>
  )
}
