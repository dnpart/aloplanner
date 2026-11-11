import { formatTime } from '../lib/format'

export const overwhelmCopy = {
  button: 'Too much?',
  showEverything: 'Show everything',
  oneNextStep: 'One next step',
  blockAt: (title: string, start: string) => `${title} at ${formatTime(start)}`,
  nothing: 'Nothing else needs you right now.',
  fallbackMessage: 'One thing at a time. The rest will wait.',
}
