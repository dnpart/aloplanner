import { format, isValid, parseISO } from 'date-fns'
import { useId, useState, type ChangeEvent } from 'react'
import { describeCount, settingsCopy } from '../../content/settings'
import {
  BackupError,
  backupFileName,
  countRows,
  exportBackup,
  importBackup,
  parseBackup,
  serializeBackup,
  type BackupFile,
  type ImportMode,
} from '../../db/backup'
import { saveTextFile } from '../../platform/files'
import { useSettingsStore } from '../../state/settingsStore'

const copy = settingsCopy.backup

type Status =
  { kind: 'idle' } | { kind: 'working' } | { kind: 'message'; text: string; tone: 'ok' | 'error' }

export function BackupSection() {
  const fileInputId = useId()
  const reloadSettings = useSettingsStore((s) => s.load)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const download = async () => {
    setStatus({ kind: 'working' })
    try {
      const backup = await exportBackup()
      saveTextFile(backupFileName(), serializeBackup(backup))
      setStatus({ kind: 'message', text: copy.downloaded, tone: 'ok' })
    } catch {
      setStatus({ kind: 'message', text: copy.errors.unknown, tone: 'error' })
    }
  }

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setConfirmReplace(false)
    try {
      setPending(parseBackup(await file.text()))
      setStatus({ kind: 'idle' })
    } catch (e) {
      setPending(null)
      const code = e instanceof BackupError ? e.code : 'unknown'
      setStatus({ kind: 'message', text: copy.errors[code], tone: 'error' })
    }
  }

  const restore = async (mode: ImportMode) => {
    if (!pending) return
    setStatus({ kind: 'working' })
    try {
      await importBackup(pending, mode)
      await reloadSettings()
      setPending(null)
      setConfirmReplace(false)
      setStatus({ kind: 'message', text: copy.restored, tone: 'ok' })
    } catch {
      setStatus({ kind: 'message', text: copy.errors.unknown, tone: 'error' })
    }
  }

  const cancel = () => {
    setPending(null)
    setConfirmReplace(false)
    setStatus({ kind: 'idle' })
  }

  const busy = status.kind === 'working'
  const exportedAt = pending ? parseISO(pending.exportedAt) : null
  const exportedLabel = exportedAt && isValid(exportedAt) ? format(exportedAt, 'MMM d, yyyy') : ''

  return (
    <section className="card stack" aria-labelledby="backup-heading">
      <h2 id="backup-heading">{copy.heading}</h2>
      <div>
        {copy.intro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={download} disabled={busy}>
        {copy.download}
      </button>

      <h3 className="label">{copy.restoreHeading}</h3>
      {!pending && (
        <>
          <input
            id={fileInputId}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={chooseFile}
            disabled={busy}
          />
          <label htmlFor={fileInputId} className="btn btn-secondary">
            {copy.chooseFile}
          </label>
        </>
      )}

      {pending && (
        <div className="stack">
          <p>{copy.previewIntro(exportedLabel)}</p>
          <ul className="backup__counts">
            {Object.entries(countRows(pending))
              .filter(([table, count]) => count > 0 && table !== 'messageLog' && table !== 'meta')
              .map(([table, count]) => (
                <li key={table}>{describeCount(table, count)}</li>
              ))}
          </ul>
          {!confirmReplace ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => restore('merge')}
                disabled={busy}
              >
                {copy.merge}
              </button>
              <p className="secondary">{copy.mergeHint}</p>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirmReplace(true)}
                disabled={busy}
              >
                {copy.replace}
              </button>
              <p className="secondary">{copy.replaceHint}</p>
            </>
          ) : (
            <>
              <p role="alert">{copy.replaceConfirm}</p>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => restore('replace')}
                disabled={busy}
              >
                {copy.replaceYes}
              </button>
            </>
          )}
          <button type="button" className="btn btn-quiet" onClick={cancel} disabled={busy}>
            {copy.cancel}
          </button>
        </div>
      )}

      <p
        aria-live="polite"
        className={status.kind === 'message' ? `status status--${status.tone}` : ''}
      >
        {status.kind === 'working' ? copy.working : status.kind === 'message' ? status.text : ''}
      </p>
    </section>
  )
}
