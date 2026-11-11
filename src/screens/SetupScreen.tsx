import { useEffect, useId, useRef, useState } from 'react'
import { Guide } from '../components/Guide'
import { ReadAloudButton } from '../components/ReadAloudButton'
import { Stepper } from '../components/Stepper'
import { TextSizePicker } from '../components/TextSizePicker'
import { formatHours, formatMinutes, setupCopy as copy } from '../content/setup'
import { getSettings } from '../db/settings'
import type { TextScale } from '../db/types'
import { useSettingsStore } from '../state/settingsStore'
import './SetupScreen.css'

const STEPS = ['welcome', 'textSize', 'sleep', 'shift', 'done'] as const
type Step = (typeof STEPS)[number]

type Draft = {
  displayName: string
  textScale: TextScale
  sleepHours: number
  getReadyMinutes: number
  commuteMinutes: number
}

export function SetupScreen() {
  const saved = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => ({
    displayName: saved?.displayName ?? '',
    textScale: saved?.textScale ?? 1,
    sleepHours: saved?.sleepHours ?? 8,
    getReadyMinutes: saved?.getReadyMinutes ?? 45,
    commuteMinutes: saved?.commuteMinutes ?? 20,
  }))
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nameId = useId()
  const nameHintId = useId()
  const step: Step = STEPS[index] ?? 'welcome'

  // Preview the text size live while choosing it.
  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(draft.textScale))
  }, [draft.textScale])

  // Move focus to the new heading so screen readers announce each step.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [index])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const finish = async () => {
    setSaving(true)
    const current = await getSettings()
    await update({ ...current, ...draft, displayName: draft.displayName.trim(), onboarded: true })
  }

  const isLast = index === STEPS.length - 1

  return (
    <main className="setup" ref={rootRef}>
      <header className="setup__header">
        <p className="label">{copy.progress(index + 1, STEPS.length)}</p>
        <ReadAloudButton target={rootRef} />
      </header>

      <form
        className="setup__body"
        onSubmit={(e) => {
          e.preventDefault()
          if (isLast) void finish()
          else setIndex((i) => i + 1)
        }}
      >
        {step === 'welcome' && (
          <>
            <h1 ref={headingRef} tabIndex={-1}>
              {copy.welcome.heading}
            </h1>
            <Guide character="fox" pose="waving" message={<p>{copy.welcome.fox}</p>} />
            <Guide character="owl" pose="happy" message={<p>{copy.welcome.owl}</p>} />
            <div className="stack">
              <label htmlFor={nameId}>{copy.welcome.nameLabel}</label>
              <input
                id={nameId}
                className="field"
                type="text"
                autoComplete="given-name"
                maxLength={40}
                value={draft.displayName}
                aria-describedby={nameHintId}
                onChange={(e) => set('displayName', e.target.value)}
              />
              <p id={nameHintId} className="secondary">
                {copy.welcome.nameHint}
              </p>
            </div>
          </>
        )}

        {step === 'textSize' && (
          <>
            <h1 ref={headingRef} tabIndex={-1}>
              {copy.textSize.heading}
            </h1>
            <Guide character="owl" pose="bowtie" message={<p>{copy.textSize.owl}</p>} />
            <TextSizePicker
              legend={copy.textSize.heading}
              legendHidden
              value={draft.textScale}
              onChange={(v) => set('textScale', v)}
            />
            <p className="card">{copy.textSize.sample}</p>
          </>
        )}

        {step === 'sleep' && (
          <>
            <h1 ref={headingRef} tabIndex={-1}>
              {copy.sleep.heading}
            </h1>
            <Guide character="owl" pose="sleepy" message={<p>{copy.sleep.owl}</p>} />
            <div className="card">
              <Stepper
                label={copy.sleep.label}
                value={draft.sleepHours}
                min={4}
                max={12}
                step={0.5}
                format={formatHours}
                onChange={(v) => set('sleepHours', v)}
              />
            </div>
          </>
        )}

        {step === 'shift' && (
          <>
            <h1 ref={headingRef} tabIndex={-1}>
              {copy.shift.heading}
            </h1>
            <Guide character="owl" message={<p>{copy.shift.owl}</p>} />
            <div className="card stack">
              <Stepper
                label={copy.shift.getReadyLabel}
                value={draft.getReadyMinutes}
                min={0}
                max={180}
                step={5}
                format={formatMinutes}
                onChange={(v) => set('getReadyMinutes', v)}
              />
              <Stepper
                label={copy.shift.commuteLabel}
                value={draft.commuteMinutes}
                min={0}
                max={180}
                step={5}
                format={formatMinutes}
                onChange={(v) => set('commuteMinutes', v)}
              />
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <h1 ref={headingRef} tabIndex={-1}>
              {copy.done.heading}
            </h1>
            <Guide character="fox" pose="happy" size="large" message={<p>{copy.done.fox}</p>} />
          </>
        )}

        <div className="setup__actions">
          {index > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIndex((i) => i - 1)}
              disabled={saving}
            >
              {copy.back}
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {isLast ? copy.finish : copy.next}
          </button>
        </div>
      </form>
    </main>
  )
}
