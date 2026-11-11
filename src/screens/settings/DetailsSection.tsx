import { useId, useState } from 'react'
import { Stepper } from '../../components/Stepper'
import { TextSizePicker } from '../../components/TextSizePicker'
import { formatHours, formatMinutes, setupCopy } from '../../content/setup'
import { settingsCopy } from '../../content/settings'
import { useSettingsStore } from '../../state/settingsStore'

const copy = settingsCopy.details

/** Edit what first-time setup asked for. Changes save right away. */
export function DetailsSection() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const nameId = useId()
  const [name, setName] = useState(settings?.displayName ?? '')

  if (!settings) return null

  return (
    <section className="card stack" aria-labelledby="details-heading">
      <h2 id="details-heading">{copy.heading}</h2>
      <div className="stack">
        <label htmlFor={nameId}>{copy.name}</label>
        <input
          id={nameId}
          className="field"
          type="text"
          autoComplete="given-name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() !== settings.displayName) void update({ displayName: name.trim() })
          }}
        />
      </div>
      <TextSizePicker
        legend={copy.textSize}
        value={settings.textScale}
        onChange={(v) => void update({ textScale: v })}
      />
      <Stepper
        label={setupCopy.sleep.label}
        value={settings.sleepHours}
        min={4}
        max={12}
        step={0.5}
        format={formatHours}
        onChange={(v) => void update({ sleepHours: v })}
      />
      <Stepper
        label={setupCopy.shift.getReadyLabel}
        value={settings.getReadyMinutes}
        min={0}
        max={180}
        step={5}
        format={formatMinutes}
        onChange={(v) => void update({ getReadyMinutes: v })}
      />
      <Stepper
        label={setupCopy.shift.commuteLabel}
        value={settings.commuteMinutes}
        min={0}
        max={180}
        step={5}
        format={formatMinutes}
        onChange={(v) => void update({ commuteMinutes: v })}
      />
    </section>
  )
}
