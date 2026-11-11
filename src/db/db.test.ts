import { beforeEach, expect, test } from 'vitest'
import { resetDb } from '../test/db'
import { listCategories } from './categories'
import { db, SCHEMA_VERSION } from './db'
import { getSettings, updateSettings } from './settings'

beforeEach(resetDb)

test('a fresh install has default settings and the five built-in categories', async () => {
  const settings = await getSettings()
  expect(settings.onboarded).toBe(false)
  expect(settings.checkInMinutes).toBe(20)
  expect(settings.sleepHours).toBe(8)

  const categories = await listCategories()
  expect(categories.map((c) => c.name)).toEqual(['Stream', 'Store', 'Commission', 'Life', 'Health'])
  expect(categories.every((c) => c.builtIn)).toBe(true)
})

test('updating settings keeps other fields', async () => {
  await updateSettings({ displayName: 'Sam', textScale: 1.3 })
  const settings = await getSettings()
  expect(settings.displayName).toBe('Sam')
  expect(settings.textScale).toBe(1.3)
  expect(settings.waterGoal).toBe(8)
})

test('missing fields in a stored record fall back to defaults', async () => {
  await db.settings.put({ id: 'app', displayName: 'Sam' } as never)
  const settings = await getSettings()
  expect(settings.displayName).toBe('Sam')
  expect(settings.messageFrequency).toBe('normal')
})

test('SCHEMA_VERSION matches the latest Dexie version', () => {
  expect(db.verno).toBe(SCHEMA_VERSION)
})
