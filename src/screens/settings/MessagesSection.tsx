import { useId } from 'react'
import { settingsCopy } from '../../content/settings'
import { useSettingsStore } from '../../state/settingsStore'

const copy = settingsCopy.messages

export function MessagesSection() {
  const frequency = useSettingsStore((s) => s.settings?.messageFrequency ?? 'normal')
  const update = useSettingsStore((s) => s.update)
  const name = useId()

  return (
    <section className="card stack" aria-labelledby="messages-heading">
      <h2 id="messages-heading">{copy.heading}</h2>
      <fieldset className="choice-group">
        <legend>{copy.legend}</legend>
        {copy.options.map((option) => (
          <label key={option.value} className="choice">
            <input
              type="radio"
              name={name}
              checked={frequency === option.value}
              onChange={() => void update({ messageFrequency: option.value })}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <p className="secondary">{copy.hint}</p>
    </section>
  )
}
