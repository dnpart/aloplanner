import { formatTime } from '../lib/format'

export const timeCheckCopy = {
  label: (time: string) => `Time check · ${time}`,
  leftOn: (title: string) => `left on ${title}.`,
  nextUp: 'Next up:',
  nothingNext: 'Nothing planned after this.',
  countdownLabel: (minutes: number, seconds: number) =>
    `${minutes} minutes and ${seconds} seconds left`,
  checklist: 'Wrap-up checklist',
  noteLabel: 'Note for future you: where I left off',
  notePlaceholder: 'Left arm done, start right arm',
  startWrapping: 'Start wrapping up',
  extend: (left: number) => `+10 min (${left} left)`,
  noExtensions: 'No more extensions for this block.',
  checkInsOff: 'Turn off check-ins for this block',
  checkInsAreOff: 'Check-ins are off for this block.',
  close: 'Close time check',
}

/** Category-specific wrap-up items. Custom categories get the default. */
export const wrapUpItems: Record<string, string[]> = {
  commission: ['Save the Live2D file'],
  stream: ['Mark any clips worth keeping'],
  store: ['Write down anything for next shift'],
  life: ['Put things back where they go'],
  health: ['Have a glass of water'],
  default: ['Save your work'],
}

export const engineCopy = {
  stillOnIt: 'Still on it',
  imDone: 'I’m done',
  reminder: (title: string, start: string) => `${title} starts at ${formatTime(start)}.`,
  notification: {
    reminder: 'Coming up',
    checkIn: 'Time check',
    wrap: '10 minutes left',
    final: '2 minutes left',
    end: 'Time’s up',
  },
}
