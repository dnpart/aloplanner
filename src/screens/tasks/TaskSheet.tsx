import { useLiveQuery } from 'dexie-react-hooks'
import { useId, useState } from 'react'
import { CloseIcon } from '../../components/icons'
import { Sheet } from '../../components/Sheet'
import { taskSheetCopy as copy } from '../../content/tasks'
import { lastLeftOffNoteForTask } from '../../db/blocks'
import { addStep, deleteStep, deleteTask, getTask, updateStep, updateTask } from '../../db/tasks'
import type { Task } from '../../db/types'
import { useCategories } from '../../hooks/useData'
import { useTaskSheet } from '../../state/taskSheetStore'

/** Task details: rename, category, and Break it down into steps. */
export function TaskSheet() {
  const { taskId, close } = useTaskSheet()
  const task = useLiveQuery(async () => (taskId ? await getTask(taskId) : undefined), [taskId])
  return (
    <Sheet open={Boolean(taskId)} title={copy.title} closeLabel={copy.close} onClose={close}>
      {task && <TaskDetails key={task.id} task={task} onDeleted={close} />}
    </Sheet>
  )
}

function TaskDetails({ task, onDeleted }: { task: Task; onDeleted: () => void }) {
  const id = useId()
  const categories = useCategories()
  const [title, setTitle] = useState(task.title)
  const [step, setStep] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const lastNote = useLiveQuery(() => lastLeftOffNoteForTask(task.id), [task.id])

  return (
    <div className="stack">
      <div className="stack">
        <label htmlFor={`${id}-name`}>{copy.name}</label>
        <input
          id={`${id}-name`}
          className="field"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title.trim() !== task.title) {
              void updateTask(task.id, { title: title.trim() })
            }
          }}
        />
      </div>

      <fieldset className="choice-group">
        <legend>{copy.category}</legend>
        <div className="block-form__chips">
          {categories.map((c) => (
            <label key={c.id} className="cat-option">
              <input
                type="radio"
                name={`${id}-cat`}
                checked={task.categoryId === c.id}
                onChange={() => void updateTask(task.id, { categoryId: c.id })}
              />
              <span
                className="cat-option__dot"
                style={{ background: c.color }}
                aria-hidden="true"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      {lastNote && (
        <div className="today-current__note">
          <p className="label">{copy.lastNote}</p>
          <p>{lastNote}</p>
        </div>
      )}

      <section className="stack" aria-labelledby={`${id}-steps`}>
        <h3 id={`${id}-steps`}>{copy.breakItDown}</h3>
        <p className="secondary">{copy.breakItDownHint}</p>
        <ul className="step-list">
          {task.steps.map((s) => (
            <li key={s.id} className={`step-row${s.done ? ' is-done' : ''}`}>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={(e) => void updateStep(task.id, s.id, { done: e.target.checked })}
                />
                {s.text}
              </label>
              <button
                type="button"
                className="icon-btn"
                aria-label={copy.deleteStep(s.text)}
                onClick={() => void deleteStep(task.id, s.id)}
              >
                <CloseIcon size={18} />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="add-row"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!step.trim()) return
            await addStep(task.id, step)
            setStep('')
          }}
        >
          <label htmlFor={`${id}-step`} className="visually-hidden">
            {copy.stepPlaceholder}
          </label>
          <input
            id={`${id}-step`}
            className="field"
            value={step}
            maxLength={120}
            placeholder={copy.stepPlaceholder}
            onChange={(e) => setStep(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            {copy.addStep}
          </button>
        </form>
      </section>

      {confirmDelete ? (
        <div className="stack">
          <p role="alert">{copy.deleteConfirm}</p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => {
              await deleteTask(task.id)
              onDeleted()
            }}
          >
            {copy.deleteYes}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          {copy.delete}
        </button>
      )}
    </div>
  )
}
