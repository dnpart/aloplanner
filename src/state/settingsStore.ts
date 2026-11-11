import { create } from 'zustand'
import { getSettings, updateSettings, type SettingsPatch } from '../db/settings'
import type { Settings } from '../db/types'

type SettingsState = {
  /** Null until loaded from the database. */
  settings: Settings | null
  load: () => Promise<void>
  update: (patch: SettingsPatch) => Promise<void>
}

/** In-memory mirror of the settings record. Writes go to the database first. */
export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  load: async () => {
    set({ settings: await getSettings() })
  },
  update: async (patch) => {
    set({ settings: await updateSettings(patch) })
  },
}))
