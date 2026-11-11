import { useLiveQuery } from 'dexie-react-hooks'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackIcon } from '../components/icons'
import { labels } from '../content/labels'
import { tasksCopy as copy } from '../content/tasks'
import {
  addTask,
  addToTopThree,
  listTasks,
  removeFromTopThree,
  somedayTasks,
  TOP_THREE_LIMIT,
} from '../db/tasks'
import { useNow } from '../hooks/useNow'
import { Screen } from '../layout/Screen'
import { dayKey } from '../lib/dates'
import { TaskRow } from './tasks/TaskRow'
import './tasks/Tasks.css'

/** Top 3 for today, plus the Someday list everything else lives in. */
export function TasksScreen() {
  const day = dayKey(useNow())
  const tasks = useLiveQuery(listTasks, []) ?? []
  const top = tasks.filter((t) => t.topThreeDate === day)
  const someday = somedayTasks(tasks, day)
  const done = tasks.filter((t) => t.done && t.topThreeDate !== day)
  const full = top.length >= TOP_THREE_LIMIT
  const [title, setTitle] = useState('')
  const inputId = useId()

  return (
    <Screen
      title={copy.title}
      leading={
        <Link to="/today" className="icon-btn" aria-label={labels.back}>
          <BackIcon />
        </Link>
      }
    >
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!title.trim()) return
          await addTask(title)
          setTitle('')
        }}
      >
        <label htmlFor={inputId}>{copy.addLabel}</label>
        <div className="add-row">
          <input
            id={inputId}
            className="field"
            value={title}
            maxLength={120}
            placeholder={copy.addPlaceholder}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            {copy.add}
          </button>
        </div>
      </form>

      <section className="card stack" aria-labelledby="top-heading">
        <div className="card-head">
          <h2 id="top-heading">{copy.topThree}</h2>
          <span className="secondary">{copy.topThreeCount(top.length)}</span>
        </div>
        {top.length === 0 ? (
          <p className="secondary">{copy.topThreeEmpty}</p>
        ) : (
          <ul className="task-list">
            {top.map((t) => (
              <TaskRow key={t.id} task={t}>
                {!t.done && (
                  <button
                    type="button"
                    className="btn btn-quiet"
                    onClick={() => void removeFromTopThree(t.id)}
                  >
                    {copy.removeFromTop}
                  </button>
                )}
              </TaskRow>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack" aria-labelledby="someday-heading">
        <h2 id="someday-heading">{copy.someday}</h2>
        {full && someday.length > 0 && <p className="secondary">{copy.topThreeFull}</p>}
        {someday.length === 0 ? (
          <p className="secondary">{copy.somedayEmpty}</p>
        ) : (
          <ul className="task-list">
            {someday.map((t) => (
              <TaskRow key={t.id} task={t}>
                {!full && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => void addToTopThree(t.id, day)}
                  >
                    {copy.addToTop}
                  </button>
                )}
              </TaskRow>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <details className="card done-list">
          <summary>{copy.doneCount(done.length)}</summary>
          <ul className="task-list">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        </details>
      )}
    </Screen>
  )
}
