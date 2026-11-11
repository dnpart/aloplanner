import { useId, useState } from 'react'
import { brainDumpCopy as copy } from '../content/brainDump'
import { addBrainDump } from '../db/brainDump'
import { useBrainDump } from '../state/brainDumpStore'
import { showNotice } from '../state/guideStore'
import { PlusIcon } from './icons'
import { Sheet } from './Sheet'
import './BrainDump.css'

/** Floating button on the cover screen; a rail button when unfolded (CSS picks one). */
export function BrainDumpButtons() {
  const show = useBrainDump((s) => s.show)
  return (
    <>
      <button type="button" className="btn brain-dump-fab" onClick={show}>
        <PlusIcon />
        {copy.button}
      </button>
      <button type="button" className="brain-dump-rail" aria-label={copy.button} onClick={show}>
        <PlusIcon size={22} />
      </button>
    </>
  )
}

/** Type one line, save, done. */
export function BrainDumpSheet() {
  const { open, close } = useBrainDump()
  return (
    <Sheet open={open} title={copy.sheetTitle} closeLabel={copy.close} onClose={close}>
      <BrainDumpForm onDone={close} />
    </Sheet>
  )
}

function BrainDumpForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('')
  const id = useId()
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        await addBrainDump(text)
        onDone()
        showNotice({
          character: 'fox',
          pose: 'happy',
          tone: 'calm',
          text: copy.saved,
        })
      }}
    >
      <label htmlFor={id}>{copy.label}</label>
      <input
        id={id}
        className="field"
        value={text}
        maxLength={200}
        placeholder={copy.placeholder}
        autoFocus
        enterKeyHint="done"
        onChange={(e) => setText(e.target.value)}
      />
      <p className="secondary">{copy.hint}</p>
      <button type="submit" className="btn btn-primary">
        {copy.save}
      </button>
    </form>
  )
}
