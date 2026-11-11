import type { FoxPose, OwlPose } from '../components/characters'

export const MESSAGE_CONTEXTS = [
  'task-done',
  'top3-done',
  'block-done',
  'check-in',
  'wrap-up',
  'final-warning',
  'block-ended',
  'overwhelm',
  'came-back',
] as const

export type MessageContext = (typeof MESSAGE_CONTEXTS)[number]

export type Message = {
  id: string
  text: string
  tone: 'funny' | 'calm'
  contexts: MessageContext[]
} & ({ character: 'owl'; pose: OwlPose } | { character: 'fox'; pose: FoxPose })

export type MessageVars = { title?: string; minutes?: number }
