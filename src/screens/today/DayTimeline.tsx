import { CheckIcon, PlusIcon } from '../../components/icons'
import { todayCopy as copy } from '../../content/today'
import type { Block, Category } from '../../db/types'
import { fromLocalISO } from '../../lib/dates'
import { formatTime } from '../../lib/format'
import { useBlockSheet } from '../../state/blockSheetStore'
import './DayTimeline.css'

const HOUR_REM = 6

type Props = {
  day: string
  blocks: Block[]
  categories: Map<string, Category>
  now: Date
  currentId?: string
}

/** Hour-by-hour view of today with a "now" line (inner screen). */
export function DayTimeline({ day, blocks, categories, now, currentId }: Props) {
  const openNew = useBlockSheet((s) => s.openNew)
  const openEdit = useBlockSheet((s) => s.openEdit)
  const dayStart = fromLocalISO(`${day}T00:00:00`).getTime()
  const hourOf = (t: number) => (t - dayStart) / 3_600_000
  const timed = blocks.filter((b) => !b.allDay)
  const nowHour = hourOf(now.getTime())
  const isToday = nowHour >= 0 && nowHour < 24

  const starts = timed.map((b) => hourOf(fromLocalISO(b.start).getTime()))
  const ends = timed.map((b) => hourOf(fromLocalISO(b.end).getTime()))
  const from = Math.max(0, Math.floor(Math.min(...starts, isToday ? nowHour - 1 : 8)))
  const to = Math.min(24, Math.ceil(Math.max(...ends, isToday ? nowHour + 3 : 20, from + 4)))
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const pos = (h: number) => `${(h - from) * HOUR_REM}rem`

  return (
    <section className="card timeline" aria-labelledby="timeline-heading">
      <div className="timeline__head">
        <h2 id="timeline-heading">{copy.timelineHeading}</h2>
        <button type="button" className="btn btn-quiet" onClick={() => openNew()}>
          <PlusIcon />
          {copy.add}
        </button>
      </div>
      <div className="timeline__grid" style={{ height: pos(to) }}>
        {hours.map((h) => (
          <div key={h} className="timeline__hour" style={{ top: pos(h) }} aria-hidden="true">
            <span>{formatTime(new Date(dayStart + h * 3_600_000)).replace(':00', '')}</span>
          </div>
        ))}
        <ol className="timeline__blocks">
          {timed.map((b) => {
            const top = Math.max(from, hourOf(fromLocalISO(b.start).getTime()))
            const bottom = Math.min(to, hourOf(fromLocalISO(b.end).getTime()))
            const cat = categories.get(b.categoryId)
            const done = b.status === 'done'
            return (
              <li key={b.id}>
                <button
                  type="button"
                  className={`timeline__block${done ? ' is-done' : ''}${b.id === currentId ? ' is-current' : ''}`}
                  style={{
                    top: pos(top),
                    height: `calc(${(bottom - top) * HOUR_REM}rem - 4px)`,
                    background: cat?.color,
                  }}
                  onClick={() => openEdit(b.id)}
                >
                  <span className="timeline__title">
                    {done && <CheckIcon size={14} />}
                    {b.title}
                  </span>
                  <span className="timeline__meta">
                    {formatTime(b.start)} · {cat?.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        {isToday && nowHour >= from && nowHour <= to && (
          <div className="timeline__now" style={{ top: pos(nowHour) }}>
            <span className="visually-hidden">{copy.now(formatTime(now))}</span>
          </div>
        )}
      </div>
    </section>
  )
}
