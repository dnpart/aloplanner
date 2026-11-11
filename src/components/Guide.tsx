import type { ReactNode } from 'react'
import { characterAlt } from '../content/characters'
import { characterArt, type FoxPose, type OwlPose } from './characters'
import './Guide.css'

export type GuideAction = {
  label: string
  onClick: () => void
}

type CharacterProps = { character: 'owl'; pose?: OwlPose } | { character: 'fox'; pose?: FoxPose }

export type GuideProps = CharacterProps & {
  message?: ReactNode
  actions?: GuideAction[]
  /** Visual size of the character. */
  size?: 'small' | 'medium' | 'large'
  /** Stack the character above the bubble (used on full-screen moments). */
  layout?: 'side' | 'stacked'
}

/**
 * A character with an optional speech bubble.
 * Screens use this instead of inlining character art.
 */
export function Guide(props: GuideProps) {
  const { message, actions, size = 'medium', layout = 'side' } = props
  const { src, alt } = resolveArt(props)

  return (
    <div className={`guide guide--${layout} guide--${size}`}>
      <img className="guide__art" src={src} alt={alt} />
      {(message || actions?.length) && (
        <div className="guide__bubble">
          {message && <div className="guide__message">{message}</div>}
          {actions && actions.length > 0 && (
            <div className="guide__actions">
              {actions.map((a) => (
                <button key={a.label} type="button" className="guide__action" onClick={a.onClick}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function resolveArt(props: CharacterProps) {
  if (props.character === 'owl') {
    const pose = props.pose ?? 'neutral'
    return { src: characterArt.owl[pose], alt: characterAlt.owl[pose] }
  }
  const pose = props.pose ?? 'neutral'
  return { src: characterArt.fox[pose], alt: characterAlt.fox[pose] }
}
