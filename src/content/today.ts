import { formatTime } from '../lib/format'

export const todayCopy = {
  rightNow: (range: string) => `Right now · ${range}`,
  minLeft: 'min left',
  ringLabel: (left: number, total: number) => `${left} minutes left of ${total}`,
  checkInsEvery: (minutes: number, next: string) =>
    `Owl checks in every ${minutes} min · next at ${next}`,
  checkInsOff: 'Check-ins are off for this block.',
  timeCheckAt: (time: string) => `Time check at ${time}`,
  lastTime: 'Where you left off',
  nextStep: 'Next step',
  done: 'Done',
  extend: '+10 min',
  noMoreExtensions: 'No more extensions for this block.',
  editBlock: (title: string) => `Edit ${title}`,
  nothingNow: 'Nothing planned right now.',
  addBlock: 'Add a block',
  next: 'Next',
  nothingNext: 'Nothing else planned today.',
  planHeading: 'Today’s plan',
  timelineHeading: 'Today',
  add: 'Add',
  emptyGuide: ['No blocks yet today.', 'Add one, and I’ll keep an eye on the clock for you.'],
  blockDoneFallback: 'Marked done.',
  undo: 'Undo',
  doneLabel: 'Done',
  now: (time: string) => `Now, ${time}`,
  extended: (
    moved: { title: string; start: string }[],
    clash?: { title: string; start: string },
  ) => {
    const lines = ['Added 10 minutes.']
    const first = moved[0]
    if (first) {
      lines.push(
        moved.length === 1
          ? `${first.title} moves to ${formatTime(first.start)}.`
          : `${first.title} and ${moved.length - 1} more move later.`,
      )
    }
    if (clash)
      lines.push(`Heads up: this now runs into ${clash.title} at ${formatTime(clash.start)}.`)
    return lines.join(' ')
  },
}

export const blockSheetCopy = {
  addTitle: 'Add a block',
  editTitle: 'Edit block',
  title: 'What is it?',
  titlePlaceholder: 'Rig arm physics',
  category: 'Category',
  date: 'Day',
  start: 'Start',
  end: 'End',
  quickLength: 'Quick length',
  lengths: [15, 30, 60, 120],
  endsNextDay: 'Ends the next day.',
  kind: 'Type',
  kindBlock: 'Block',
  kindBlockHint: 'Can move if earlier blocks run long.',
  kindAppointment: 'Appointment',
  kindAppointmentHint: 'Fixed time. Never moves.',
  task: 'Linked task',
  noTask: 'None',
  checkIns: 'Owl checks in during this block',
  reminder: 'Reminder before it starts',
  reminderOptions: [
    { value: 0, label: 'None' },
    { value: 5, label: '5 min before' },
    { value: 10, label: '10 min before' },
    { value: 15, label: '15 min before' },
    { value: 30, label: '30 min before' },
  ],
  notes: 'Notes',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  delete: 'Delete block',
  deleteConfirm: 'Delete this block? This can’t be undone.',
  deleteYes: 'Yes, delete',
  errors: {
    title: 'Give the block a name.',
    time: 'Pick a start and end time.',
  },
}
