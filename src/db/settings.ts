import { db } from './db'
import { DEFAULT_SETTINGS } from './defaults'
import type { Settings } from './types'

export type SettingsPatch = Partial<Omit<Settings, 'id'>>

/** Reads settings, filling any missing fields with defaults. */
export async function getSettings(): Promise<Settings> {
  const stored = await db.settings.get('app')
  return { ...DEFAULT_SETTINGS, ...stored, id: 'app' }
}

export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  return db.transaction('rw', db.settings, async () => {
    const next: Settings = { ...(await getSettings()), ...patch, id: 'app' }
    await db.settings.put(next)
    return next
  })
}
