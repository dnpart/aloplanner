import { useId } from 'react'
import { stepperLabels } from '../content/setup'
import { MinusIcon, PlusIcon } from './icons'
import './Stepper.css'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
}

/** A number picker with large − and + buttons. Easier than typing on a phone. */
export function Stepper({ label, value, min, max, step, format, onChange }: Props) {
  const labelId = useId()
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))

  return (
    <div className="stepper" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="stepper__label">
        {label}
      </span>
      <div className="stepper__controls">
        <button
          type="button"
          className="icon-btn"
          aria-label={stepperLabels.less(label)}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
        >
          <MinusIcon />
        </button>
        <output className="stepper__value" aria-live="polite">
          {format(value)}
        </output>
        <button
          type="button"
          className="icon-btn"
          aria-label={stepperLabels.more(label)}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  )
}
