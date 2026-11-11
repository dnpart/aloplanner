import { formatDistance } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { BackIcon } from '../components/icons'
import { brainDumpCopy as copy } from '../content/brainDump'
import { labels } from '../content/labels'
import { deleteBrainDump, listInbox, markProcessed, restoreBrainDump } from '../db/brainDump'
import { addTask } from '../db/tasks'
import type { BrainDumpItem } from '../db/types'
import { useNow } from '../hooks/useNow'
import { Screen } from '../layout/Screen'
import { fromLocalISO } from '../lib/dates'
import { useBlockSheet } from '../state/blockSheetStore'
import { showNotice } from '../state/guideStore'
import './tasks/Tasks.css'

/** Sort brain dump items into a task or a block, or delete them. */
export function InboxScreen() {
  const items = useLiveQuery(listInbox, [])
  const now = useNow()
  const openNew = useBlockSheet((s) => s.openNew)

  const toast = (text: string, undo?: () => void) =>
    showNotice({
      character: 'fox',
      pose: 'happy',
      tone: 'funny',
      text,
      actions: undo ? [{ label: copy.undo, onClick: undo }] : undefined,
    })

  const toTask = async (item: BrainDumpItem) => {
    await addTask(item.text)
    await markProcessed(item.id)
    toast(copy.addedToSomeday)
  }
  const remove = async (item: BrainDumpItem) => {
    await deleteBrainDump(item.id)
    toast(copy.deleted, () => void restoreBrainDump(item))
  }

  return (
    <Screen
      title={copy.inboxTitle}
      leading={
        <Link to="/today" className="icon-btn" aria-label={labels.back}>
          <BackIcon />
        </Link>
      }
    >
      <div>
        {copy.inboxIntro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {items?.length === 0 && <p className="card">{copy.empty}</p>}
      {items && items.length > 0 && (
        <ul className="inbox">
          {items.map((item) => (
            <li key={item.id} className="card stack">
              <p className="inbox__text">{item.text}</p>
              <p className="secondary">
                {copy.savedAt(
                  formatDistance(fromLocalISO(item.createdAt), now, { addSuffix: true }),
                )}
              </p>
              <div className="inbox__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void toTask(item)}
                >
                  {copy.toTask}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openNew({ title: item.text }, () => void markProcessed(item.id))}
                >
                  {copy.toBlock}
                </button>
                <button
                  type="button"
                  className="btn btn-quiet"
                  aria-label={copy.removeLabel(item.text)}
                  onClick={() => void remove(item)}
                >
                  {copy.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
