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
