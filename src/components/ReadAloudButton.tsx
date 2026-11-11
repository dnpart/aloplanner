import { useEffect, useState, type RefObject } from 'react'
import { labels } from '../content/labels'
import { collectReadableText, isSpeechSupported, speak, stopSpeaking } from '../platform/speech'
import { SpeakerIcon, StopIcon } from './icons'

type Props = {
  /** The screen container to read. */
  target: RefObject<HTMLElement | null>
  /** Optional fixed text instead of reading the container. */
  text?: string
}

/** Reads the current screen aloud. Hidden when the device has no speech support. */
export function ReadAloudButton({ target, text }: Props) {
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => stopSpeaking(), [])

  if (!isSpeechSupported()) return null

  const toggle = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    const content = text ?? (target.current ? collectReadableText(target.current) : '')
    if (!content) return
    setSpeaking(true)
    speak(content, { onEnd: () => setSpeaking(false) })
  }

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={speaking ? labels.stopReading : labels.readAloud}
      aria-pressed={speaking}
      onClick={toggle}
    >
      {speaking ? <StopIcon /> : <SpeakerIcon />}
    </button>
  )
}
