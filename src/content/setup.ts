import type { TextScale } from '../db/types'

export const setupCopy = {
  progress: (step: number, total: number) => `Step ${step} of ${total}`,
  back: 'Back',
  next: 'Next',
  finish: 'Let’s go',
  welcome: {
    heading: 'Welcome to Aloplanner',
    fox: 'Hi! I’m the fox. I cheer for your wins, big and small.',
    owl: 'And I’m the owl. I keep an eye on the clock so you don’t have to.',
    nameLabel: 'What should we call you?',
    nameHint: 'This stays on this device.',
  },
  textSize: {
    heading: 'Pick a text size',
    owl: 'Choose what feels easy to read. You can change it later in Settings.',
    sample: 'Rig arm physics, then post a clip.',
  },
  sleep: {
    heading: 'How much sleep do you need?',
    owl: 'Before work days, I’ll help you get to bed on time.',
    label: 'Sleep',
  },
  shift: {
    heading: 'Getting to work',
    owl: 'These help work out your wake-up time and bedtime before a shift.',
    getReadyLabel: 'Time to get ready',
    commuteLabel: 'Commute',
  },
  done: {
    heading: 'You’re all set',
    fox: 'That’s it. Setup done in record time.',
  },
}

export const textSizeOptions: { value: TextScale; label: string }[] = [
  { value: 1, label: 'Standard' },
  { value: 1.15, label: 'Larger' },
  { value: 1.3, label: 'Largest' },
]

export function formatHours(hours: number): string {
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

export const stepperLabels = {
  less: (label: string) => `Less ${label.toLowerCase()}`,
  more: (label: string) => `More ${label.toLowerCase()}`,
}
