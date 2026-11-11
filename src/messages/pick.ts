import type { MessageFrequency, MessageLog } from '../db/types'
import { fromLocalISO } from '../lib/dates'
import type { Message, MessageContext } from './types'

const NO_REPEAT_DAYS = 7

/** Contexts that are pure encouragement and follow the frequency setting. */
const OPTIONAL_CONTEXTS: MessageContext[] = ['task-done', 'block-done']

const chance: Record<MessageFrequency, number> = { low: 0.35, normal: 0.7, high: 1 }

export function shouldShow(
  context: MessageContext,
  frequency: MessageFrequency,
  random = Math.random,
): boolean {
  return !OPTIONAL_CONTEXTS.includes(context) || random() < chance[frequency]
}

/**
 * Picks a message for a context, avoiding anything shown in the last
 * 7 days. If every message was shown recently, uses the one shown longest ago.
 */
export function pickMessage(
  bank: Message[],
  context: MessageContext,
  log: MessageLog[],
  now: Date,
  random = Math.random,
): Message | undefined {
  const candidates = bank.filter((m) => m.contexts.includes(context))
  if (candidates.length === 0) return undefined
  const lastShown = new Map(log.map((l) => [l.messageId, fromLocalISO(l.shownAt).getTime()]))
  const cutoff = now.getTime() - NO_REPEAT_DAYS * 24 * 60 * 60_000
  const fresh = candidates.filter((m) => (lastShown.get(m.id) ?? -Infinity) < cutoff)
  if (fresh.length > 0) return fresh[Math.floor(random() * fresh.length)]
  return [...candidates].sort((a, b) => (lastShown.get(a.id) ?? 0) - (lastShown.get(b.id) ?? 0))[0]
}
