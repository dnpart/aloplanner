export type Theme = 'night' | 'day' | 'auto'
export type MessageFrequency = 'low' | 'normal' | 'high'
export type TextScale = 1 | 1.15 | 1.3

export type Settings = {
  /** Always 'app': there is one settings record. */
  id: 'app'
  displayName: string
  theme: Theme
  textScale: TextScale
  checkInMinutes: number
  extensionsPerBlock: number
  sleepHours: number
  getReadyMinutes: number
  commuteMinutes: number
  waterGoal: number
  messageFrequency: MessageFrequency
  onboarded: boolean
}

export type Category = {
  id: string
  name: string
  /** Hex color. Always shown next to the name, never alone. */
  color: string
  builtIn: boolean
}

export type BlockKind = 'block' | 'appointment' | 'task'
export type BlockStatus = 'planned' | 'active' | 'done' | 'skipped'
/** Weekly repeat rule (Phase 3). 0 = Sunday. */
export type Recurrence = { weekdays: number[] } | null

/** Alert keys the time engine has already fired for a block. */
export type AlertKey = string

export type Block = {
  id: string
  title: string
  categoryId: string
  /** Local ISO date-time. */
  start: string
  end: string
  allDay: boolean
  notes: string
  kind: BlockKind
  recurrence: Recurrence
  /** Minutes before start to send a reminder. */
  reminders: number[]
  checkIns: boolean
  leftOffNote: string
  status: BlockStatus
  taskId?: string
  /** How many "+10 min" extensions were used. */
  extensionsUsed: number
  alertsFired: AlertKey[]
}

export type TaskStep = { id: string; text: string; done: boolean }

export type Task = {
  id: string
  title: string
  categoryId: string
  /** Day key, e.g. "2026-11-11". */
  dueDate?: string
  /** The day this task is in the Top 3. */
  topThreeDate?: string
  someday: boolean
  steps: TaskStep[]
  done: boolean
  doneAt?: string
  createdAt: string
}

export type BrainDumpItem = {
  id: string
  text: string
  createdAt: string
  processed: boolean
}

export type Meal = 'breakfast' | 'lunch' | 'dinner'

export type HealthLog = {
  /** Day key. */
  date: string
  water: number
  meals: Record<Meal, boolean>
}

export type MessageLog = {
  messageId: string
  shownAt: string
}

/** Small app bookkeeping values, e.g. when the app was last open. */
export type MetaEntry = {
  key: string
  value: string
}
