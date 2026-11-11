import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useId, useRef, useState } from 'react'
import { Guide } from '../components/Guide'
import { CloseIcon } from '../components/icons'
import { timeCheckCopy as copy, wrapUpItems } from '../content/timeCheck'
import { getBlock, listBlocksForDay, nextBlock, updateBlock } from '../db/blocks'
import type { Block } from '../db/types'
import { useNow } from '../hooks/useNow'
import { fromLocalISO } from '../lib/dates'
import { formatTime } from '../lib/format'
import { useSettingsStore } from '../state/settingsStore'
import { useTimeCheck } from '../state/timeCheckStore'
import { canExtend, extendCurrentBlock } from './today/blockActions'
import './TimeCheckScreen.css'

/** The full-screen interruption 10 minutes before a block ends. */
export function TimeCheckScreen() {
  const { blockId, message, close } = useTimeCheck()
  const ref = useRef<HTMLDialogElement>(null)
  const block = useLiveQuery(async () => (blockId ? await getBlock(blockId) : undefined), [blockId])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (blockId && !dialog.open) dialog.showModal?.()
    if (!blockId && dialog.open) dialog.close?.()
  }, [blockId])

  return (
    <dialog
      ref={ref}
      className="time-check"
      aria-labelledby="time-check-count"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
    >
      {blockId && block && (
        <TimeCheckContent key={block.id} block={block} message={message ?? ''} onClose={close} />
      )}
    </dialog>
  )
}

function TimeCheckContent({
  block,
  message,
  onClose,
}: {
  block: Block
  message: string
  onClose: () => void
}) {
  const now = useNow(1000)
  const extensionsPerBlock = useSettingsStore((s) => s.settings?.extensionsPerBlock ?? 1)
  const [note, setNote] = useState(block.leftOffNote)
  const [checkInsOff, setCheckInsOff] = useState(!block.checkIns)
  const noteId = useId()
  const next = useLiveQuery(async () => {
    const blocks = await listBlocksForDay(block.start.slice(0, 10))
    // A block that starts exactly when this one ends counts as next.
    return nextBlock(blocks, new Date(fromLocalISO(block.end).getTime() - 1), block) ?? null
  }, [block.id, block.end])

  const secondsLeft = Math.max(
    0,
    Math.round((fromLocalISO(block.end).getTime() - now.getTime()) / 1000),
  )
  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60
  const items = wrapUpItems[block.categoryId] ?? wrapUpItems.default ?? []
  const extensionsLeft = Math.max(0, extensionsPerBlock - block.extensionsUsed)

  const saveNote = () => {
    if (note !== block.leftOffNote) void updateBlock(block.id, { leftOffNote: note.trim() })
  }
  const finish = () => {
    saveNote()
    onClose()
  }

  return (
    <div className="time-check__inner">
      <button
        type="button"
        className="icon-btn time-check__close"
        aria-label={copy.close}
        onClick={finish}
      >
        <CloseIcon />
      </button>
      <Guide
        character="owl"
        pose="neutral"
        size="large"
        layout="stacked"
        message={message ? <p>{message}</p> : undefined}
      />

      <div className="time-check__count">
        <p className="label">{copy.label(formatTime(now))}</p>
        <p
          id="time-check-count"
          className="time-check__clock"
          aria-label={copy.countdownLabel(mm, ss)}
        >
          {mm}:{String(ss).padStart(2, '0')}
        </p>
        <p>
          {copy.leftOn(block.title)}{' '}
          {next ? (
            <>
              {copy.nextUp} <strong>{next.title}</strong>
            </>
          ) : (
            next === null && copy.nothingNext
          )}
        </p>
      </div>

      <div className="card stack time-check__list">
        <p className="label">{copy.checklist}</p>
        {items.map((item) => (
          <label key={item} className="choice">
            <input type="checkbox" />
            {item}
          </label>
        ))}
        <div className="stack">
          <label htmlFor={noteId}>{copy.noteLabel}</label>
          <input
            id={noteId}
            className="field"
            value={note}
            placeholder={copy.notePlaceholder}
            maxLength={200}
            onChange={(e) => setNote(e.target.value)}
            onBlur={saveNote}
          />
        </div>
      </div>

      <div className="time-check__actions">
        <button type="button" className="btn btn-primary" onClick={finish}>
          {copy.startWrapping}
        </button>
        {canExtend(block, extensionsPerBlock) ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              saveNote()
              void extendCurrentBlock(block)
              onClose()
            }}
          >
            {copy.extend(extensionsLeft)}
          </button>
        ) : (
          <p className="secondary">{copy.noExtensions}</p>
        )}
        {checkInsOff ? (
          <p className="secondary time-check__center">{copy.checkInsAreOff}</p>
        ) : (
          <button
            type="button"
            className="link-btn time-check__center"
            onClick={() => {
              setCheckInsOff(true)
              void updateBlock(block.id, { checkIns: false })
            }}
          >
            {copy.checkInsOff}
          </button>
        )}
      </div>
    </div>
  )
}
