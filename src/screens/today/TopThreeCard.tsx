import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { tasksCopy as copy } from '../../content/tasks'
import { listTasks, somedayTasks } from '../../db/tasks'
import { TaskRow } from '../tasks/TaskRow'
import '../tasks/Tasks.css'

export function TopThreeCard({ day }: { day: string }) {
  const tasks = useLiveQuery(listTasks, [])
  if (!tasks) return null
  const top = tasks.filter((t) => t.topThreeDate === day)
  const someday = somedayTasks(tasks, day)

  return (
    <section className="card stack" aria-labelledby="today-top-heading">
      <div className="card-head">
        <h2 id="today-top-heading" className="label">
          {copy.topThree}
        </h2>
        <Link to="/tasks">{copy.somedayCount(someday.length)}</Link>
      </div>
      {top.length === 0 && <p className="secondary">{copy.topThreeEmpty}</p>}
      {top.length > 0 && (
        <ul className="task-list">
          {top.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </ul>
      )}
      {top.length < 3 && (
        <Link to="/tasks" className="btn btn-secondary">
          {copy.pickTopThree}
        </Link>
      )}
    </section>
  )
}
