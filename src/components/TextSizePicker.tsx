import { useId } from 'react'
import { textSizeOptions } from '../content/setup'
import type { TextScale } from '../db/types'
import './TextSizePicker.css'

type Props = {
  legend: string
  /** Hide the legend visually when a heading already says the same thing. */
  legendHidden?: boolean
  value: TextScale
  onChange: (value: TextScale) => void
}

export function TextSizePicker({ legend, legendHidden = false, value, onChange }: Props) {
  const name = useId()
  return (
    <fieldset className="text-size">
      <legend className={legendHidden ? 'visually-hidden' : 'label'}>{legend}</legend>
      <div className="text-size__options">
        {textSizeOptions.map((option) => (
          <label key={option.value} className="text-size__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span
              className="text-size__sample"
              aria-hidden="true"
              style={{ fontSize: `${1.25 * option.value}rem` }}
            >
              Aa
            </span>
            <span>
              {option.label} · {Math.round(option.value * 100)}%
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
