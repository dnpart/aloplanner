import { addMinutes, format, parse } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useId, useState, type FormEvent } from 'react'
import { Sheet } from '../../components/Sheet'
import { blockSheetCopy as copy } from '../../content/today'
import { deleteBlock, getBlock, newBlock, saveBlock } from '../../db/blocks'
import { listTasks } from '../../db/tasks'
import type { Block, BlockKind } from '../../db/types'
import { useCategories } from '../../hooks/useData'
import { dayKey, fromLocalISO, toLocalISO } from '../../lib/dates'
import { useBlockSheet } from '../../state/blockSheetStore'
import './BlockSheet.css'

/** The one add/edit block sheet. Opened through useBlockSheet from anywhere. */
export function BlockSheet() {
  const { open, blockId, draft, onSaved, close } = useBlockSheet()
  // undefined while loading, null for a new block
  const existing = useLiveQuery(
    async () => (blockId ? ((await getBlock(blockId)) ?? null) : null),
    [blockId],
  )
  const ready = !blockId || existing !== undefined

  return (
    <Sheet
      open={open}
      title={blockId ? copy.editTitle : copy.addTitle}
      closeLabel={copy.close}
      onClose={close}
    >
      {open && ready && (
        <BlockForm
          key={blockId ?? 'new'}
          existing={existing ?? undefined}
          draft={draft}
          onDone={(saved) => {
            if (saved && !blockId) onSaved?.(saved)
            close()
          }}
        />
      )}
    </Sheet>
  )
}

type FormState = {
  title: string
  categoryId: string
  date: string
  start: string
  end: string
  kind: BlockKind
  taskId: string
  checkIns: boolean
  reminder: number
  notes: string
}

function initialState(existing?: Block, draft?: Partial<Block>): FormState {
  const source = existing ?? draft
  const now = new Date()
  // Default: the next quarter hour, for one hour.
  const startDate = source?.start
    ? fromLocalISO(source.start)
    : new Date(Math.ceil(now.getTime() / 900_000) * 900_000)
  const endDate = source?.end ? fromLocalISO(source.end) : addMinutes(startDate, 60)
  return {
    title: source?.title ?? '',
    categoryId: source?.categoryId ?? 'life',
    date: dayKey(startDate),
    start: format(startDate, 'HH:mm'),
    end: format(endDate, 'HH:mm'),
    kind: source?.kind === 'appointment' ? 'appointment' : 'block',
    taskId: source?.taskId ?? '',
    checkIns: source?.checkIns ?? true,
    reminder: source?.reminders?.[0] ?? 0,
    notes: source?.notes ?? '',
  }
}

function toRange(state: FormState): { start: string; end: string; nextDay: boolean } | null {
  if (!state.date || !state.start || !state.end) return null
  const start = parse(`${state.date} ${state.start}`, 'yyyy-MM-dd HH:mm', new Date())
  let end = parse(`${state.date} ${state.end}`, 'yyyy-MM-dd HH:mm', new Date())
  const nextDay = end <= start
  if (nextDay) end = addMinutes(end, 24 * 60)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return { start: toLocalISO(start), end: toLocalISO(end), nextDay }
}

function BlockForm({
  existing,
  draft,
  onDone,
}: {
  existing?: Block
  draft?: Partial<Block>
  onDone: (saved?: Block) => void
}) {
  const [state, setState] = useState(() => initialState(existing, draft))
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const categories = useCategories()
  const tasks = useLiveQuery(listTasks, []) ?? []
  const openTasks = tasks.filter((t) => !t.done || t.id === state.taskId)
  const id = useId()
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }))
  const range = toRange(state)

  const setLength = (minutes: number) => {
    const start = parse(state.start, 'HH:mm', new Date())
    if (!Number.isNaN(start.getTime())) set('end', format(addMinutes(start, minutes), 'HH:mm'))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!state.title.trim()) return setError(copy.errors.title)
    if (!range) return setError(copy.errors.time)
    const fields = {
      title: state.title.trim(),
      categoryId: state.categoryId,
      start: range.start,
      end: range.end,
      kind: state.kind,
      taskId: state.taskId || undefined,
      checkIns: state.checkIns,
      reminders: state.reminder ? [state.reminder] : [],
      notes: state.notes,
    }
    let saved: Block
    if (existing) {
      const timeChanged = existing.start !== range.start || existing.end !== range.end
      saved = {
        ...existing,
        ...fields,
        // New times mean the warnings should fire again.
        alertsFired: timeChanged ? [] : existing.alertsFired,
      }
    } else {
      saved = newBlock(fields)
    }
    await saveBlock(saved)
    onDone(saved)
  }

  return (
    <form className="block-form" onSubmit={submit} noValidate>
      <div className="stack">
        <label htmlFor={`${id}-title`}>{copy.title}</label>
        <input
          id={`${id}-title`}
          className="field"
          value={state.title}
          placeholder={copy.titlePlaceholder}
          maxLength={80}
          onChange={(e) => set('title', e.target.value)}
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
                checked={state.categoryId === c.id}
                onChange={() => set('categoryId', c.id)}
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

      <div className="block-form__times">
        <div className="stack">
          <label htmlFor={`${id}-date`}>{copy.date}</label>
          <input
            id={`${id}-date`}
            className="field"
            type="date"
            value={state.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div className="stack">
          <label htmlFor={`${id}-start`}>{copy.start}</label>
          <input
            id={`${id}-start`}
            className="field"
            type="time"
            value={state.start}
            onChange={(e) => set('start', e.target.value)}
          />
        </div>
        <div className="stack">
          <label htmlFor={`${id}-end`}>{copy.end}</label>
          <input
            id={`${id}-end`}
            className="field"
            type="time"
            value={state.end}
            onChange={(e) => set('end', e.target.value)}
          />
        </div>
      </div>
      {range?.nextDay && <p className="secondary">{copy.endsNextDay}</p>}

      <div className="stack">
        <span className="label" id={`${id}-len`}>
          {copy.quickLength}
        </span>
        <div className="block-form__lengths" role="group" aria-labelledby={`${id}-len`}>
          {copy.lengths.map((m) => (
            <button key={m} type="button" className="btn btn-quiet" onClick={() => setLength(m)}>
              {m < 60 ? `${m} min` : `${m / 60} hr`}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="choice-group">
        <legend>{copy.kind}</legend>
        <label className="choice">
          <input
            type="radio"
            name={`${id}-kind`}
            checked={state.kind === 'block'}
            onChange={() => set('kind', 'block')}
          />
          <span>
            {copy.kindBlock}
            <span className="secondary block-form__hint">{copy.kindBlockHint}</span>
          </span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name={`${id}-kind`}
            checked={state.kind === 'appointment'}
            onChange={() => set('kind', 'appointment')}
          />
          <span>
            {copy.kindAppointment}
            <span className="secondary block-form__hint">{copy.kindAppointmentHint}</span>
          </span>
        </label>
      </fieldset>

      <label className="choice">
        <input
          type="checkbox"
          checked={state.checkIns}
          onChange={(e) => set('checkIns', e.target.checked)}
        />
        {copy.checkIns}
      </label>

      <div className="stack">
        <label htmlFor={`${id}-reminder`}>{copy.reminder}</label>
        <select
          id={`${id}-reminder`}
          className="field"
          value={state.reminder}
          onChange={(e) => set('reminder', Number(e.target.value))}
        >
          {copy.reminderOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {openTasks.length > 0 && (
        <div className="stack">
          <label htmlFor={`${id}-task`}>{copy.task}</label>
          <select
            id={`${id}-task`}
            className="field"
            value={state.taskId}
            onChange={(e) => set('taskId', e.target.value)}
          >
            <option value="">{copy.noTask}</option>
            {openTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="stack">
        <label htmlFor={`${id}-notes`}>{copy.notes}</label>
        <textarea
          id={`${id}-notes`}
          className="field block-form__notes"
          rows={3}
          value={state.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="status status--error">
          {error}
        </p>
      )}

      <div className="block-form__actions">
        <button type="button" className="btn btn-secondary" onClick={() => onDone()}>
          {copy.cancel}
        </button>
        <button type="submit" className="btn btn-primary">
          {copy.save}
        </button>
      </div>

      {existing &&
        (confirmDelete ? (
          <div className="stack">
            <p role="alert">{copy.deleteConfirm}</p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                await deleteBlock(existing.id)
                onDone()
              }}
            >
              {copy.deleteYes}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            {copy.delete}
          </button>
        ))}
    </form>
  )
}
