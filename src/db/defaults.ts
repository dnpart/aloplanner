import { builtInCategoryNames } from '../content/categories'
import type { Category, Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  displayName: '',
  theme: 'night',
  textScale: 1,
  checkInMinutes: 20,
  extensionsPerBlock: 1,
  sleepHours: 8,
  getReadyMinutes: 45,
  commuteMinutes: 20,
  waterGoal: 8,
  messageFrequency: 'normal',
  onboarded: false,
}

/**
 * Built-in categories keep stable ids (not UUIDs) so later features can
 * refer to them, e.g. the commission wrap-up item "Save the Live2D file".
 * Colors match the --cat-* tokens.
 */
export const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'stream', name: builtInCategoryNames.stream, color: '#B9A6FF', builtIn: true },
  { id: 'store', name: builtInCategoryNames.store, color: '#FFB574', builtIn: true },
  { id: 'commission', name: builtInCategoryNames.commission, color: '#F4A3C0', builtIn: true },
  { id: 'life', name: builtInCategoryNames.life, color: '#7FD6C7', builtIn: true },
  { id: 'health', name: builtInCategoryNames.health, color: '#FFE08A', builtIn: true },
]
