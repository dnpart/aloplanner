import { useLiveQuery } from 'dexie-react-hooks'
import { CategoryChip } from '../../components/CategoryChip'
import { ClockIcon, EditIcon } from '../../components/icons'
import { TimeRing } from '../../components/TimeRing'
import { todayCopy as copy } from '../../content/today'
import { previousLeftOffNote } from '../../db/blocks'
import { getTask, nextStep } from '../../db/tasks'
import type { Block, Category } from '../../db/types'
import { nextCheckIn, WRAP_MINUTES } from '../../engine/schedule'
import { fromLocalISO, minutesBetween } from '../../lib/dates'
import { formatTime, formatTimeRange } from '../../lib/format'
import { useBlockSheet } from '../../state/blockSheetStore'
import { canExtend, completeBlock, extendCurrentBlock } from './blockActions'

type Props = {
  block: Block
  category?: Category
  now: Date
  checkInMinutes: number
  extensionsPerBlock: number
}

export function CurrentBlockCard({
  block,
  category,
  now,
  checkInMinutes,
  extensionsPerBlock,
}: Props) {
  const openEdit = useBlockSheet((s) => s.openEdit)
  const lastNote = useLiveQuery(
    () => previousLeftOffNote(block),
    [block.id, block.taskId, block.title],
  )
  const task = useLiveQuery(
    async () => (block.taskId ? await getTask(block.taskId) : undefined),
    [block.taskId],
  )
  const step = task ? nextStep(task) : undefined
  const total = minutesBetween(block.start, block.end)
  const left = (fromLocalISO(block.end).getTime() - now.getTime()) / 60_000
  const nextCheck = block.checkIns ? nextCheckIn(block, now, checkInMinutes) : undefined
  const extendable = canExtend(block, extensionsPerBlock)
  const wrapAt = new Date(fromLocalISO(block.end).getTime() - WRAP_MINUTES * 60_000)
  const clockLine = nextCheck
    ? copy.checkInsEvery(checkInMinutes, formatTime(nextCheck))
    : total > 15 && wrapAt > now
      ? copy.timeCheckAt(formatTime(wrapAt))
      : !block.checkIns
        ? copy.checkInsOff
        : null

  return (
    <section className="card today-current" aria-labelledby="current-title">
      <div className="today-current__top">
        <div className="today-current__info">
          <p className="label">{copy.rightNow(formatTimeRange(block.start, block.end))}</p>
          <h2 id="current-title">{block.title}</h2>
          <CategoryChip category={category} />
        </div>
        <TimeRing minutesLeft={left} totalMinutes={total} />
      </div>

      {lastNote && (
        <div className="today-current__note">
          <p className="label">{copy.lastTime}</p>
          <p>{lastNote.leftOffNote}</p>
        </div>
      )}
      {step && (
        <p>
          <span className="secondary">{copy.nextStep}: </span>
          {step.text}
        </p>
      )}

      {clockLine && (
        <p className="secondary today-current__checkin">
          <ClockIcon />
          {clockLine}
        </p>
      )}

      <div className="today-current__actions">
        <button type="button" className="btn btn-primary" onClick={() => void completeBlock(block)}>
          {copy.done}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!extendable}
          aria-describedby={extendable ? undefined : 'no-more-ext'}
          onClick={() => void extendCurrentBlock(block)}
        >
          {copy.extend}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={copy.editBlock(block.title)}
          onClick={() => openEdit(block.id)}
        >
          <EditIcon />
        </button>
      </div>
      {!extendable && (
        <p id="no-more-ext" className="secondary">
          {copy.noMoreExtensions}
        </p>
      )}
    </section>
  )
}

export function NothingNowCard() {
  const openNew = useBlockSheet((s) => s.openNew)
  return (
    <section className="card stack">
      <p>{copy.nothingNow}</p>
      <button type="button" className="btn btn-primary" onClick={() => openNew()}>
        {copy.addBlock}
      </button>
    </section>
  )
}

export function NextBlockRow({ block, category }: { block?: Block; category?: Category }) {
  const openEdit = useBlockSheet((s) => s.openEdit)
  if (!block) return null
  return (
    <button type="button" className="card today-next" onClick={() => openEdit(block.id)}>
      <span className="secondary today-next__time">
        {copy.next} {formatTime(block.start)}
      </span>
      <span className="today-next__title">{block.title}</span>
      <CategoryChip category={category} />
    </button>
  )
}
