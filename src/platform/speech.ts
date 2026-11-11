/**
 * Text-to-speech. Web Speech API now; a native TTS implementation can
 * replace this module's internals later without changing callers.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export type SpeakOptions = {
  onEnd?: () => void
}

let current: SpeechSynthesisUtterance | null = null

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSupported()) return
  stopSpeaking()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = document.documentElement.lang || 'en-US'
  utterance.rate = 0.95
  let finished = false
  const done = () => {
    // Browsers may fire end after cancel too; only report once.
    if (finished) return
    finished = true
    if (current === utterance) current = null
    options.onEnd?.()
  }
  utterance.onend = done
  utterance.onerror = done
  current = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  const utterance = current
  current = null
  window.speechSynthesis.cancel()
  utterance?.onend?.call(utterance, new Event('end') as SpeechSynthesisEvent)
}

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'BUTTON',
  'INPUT',
  'SELECT',
  'TEXTAREA',
  'NAV',
  'svg',
])

/**
 * Collects the readable text inside an element, one block per line.
 * Skips controls, navigation, hidden content, and anything marked
 * `data-read-skip`. Images contribute nothing (their bubble text is read).
 */
export function collectReadableText(root: Element): string {
  const parts: string[] = []

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (text) parts.push(text)
      return
    }
    if (!(node instanceof Element)) return
    if (SKIP_TAGS.has(node.tagName)) return
    if (node.getAttribute('aria-hidden') === 'true') return
    if (node.hasAttribute('hidden') || node.hasAttribute('data-read-skip')) return
    if (node.tagName === 'LABEL') {
      // Read a label together with the value of its control.
      const text = node.textContent?.replace(/\s+/g, ' ').trim()
      if (text) parts.push(text)
      return
    }
    node.childNodes.forEach(walk)
  }

  walk(root)
  return parts.join('\n')
}
