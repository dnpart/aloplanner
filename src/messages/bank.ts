import data from '../content/messages.json'
import type { Message, MessageVars } from './types'

/** The message bank from src/content/messages.json. */
export const messageBank = data.messages as Message[]

export function fillMessage(text: string, vars: MessageVars = {}): string {
  return text
    .replaceAll('{title}', vars.title ?? '')
    .replaceAll('{minutes}', vars.minutes === undefined ? '' : String(vars.minutes))
}
