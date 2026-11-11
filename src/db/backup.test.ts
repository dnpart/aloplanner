import { beforeEach, expect, test } from 'vitest'
import { resetDb } from '../test/db'
import {
  BackupError,
  countRows,
  exportBackup,
  importBackup,
  parseBackup,
  serializeBackup,
} from './backup'
import { listCategories } from './categories'
import { db, SCHEMA_VERSION } from './db'
import { getSettings, updateSettings } from './settings'

beforeEach(resetDb)

const custom = { id: 'c-1', name: 'Gym', color: '#7FD6C7', builtIn: false }

test('export then replace-import restores every table', async () => {
  await updateSettings({ displayName: 'Sam', sleepHours: 7.5, onboarded: true })
  await db.categories.add(custom)
  const text = serializeBackup(await exportBackup())

  await resetDb()
  const parsed = parseBackup(text)
  expect(countRows(parsed)).toMatchObject({ settings: 1, categories: 6, blocks: 0, tasks: 0 })
  await importBackup(parsed, 'replace')

  const settings = await getSettings()
  expect(settings.displayName).toBe('Sam')
  expect(settings.sleepHours).toBe(7.5)
  expect((await listCategories()).map((c) => c.name)).toContain('Gym')
})

test('merge keeps records that are only on the device', async () => {
  const text = serializeBackup(await exportBackup())
  await db.categories.add(custom)
  await importBackup(parseBackup(text), 'merge')
  expect(await db.categories.get('c-1')).toEqual(custom)
})

test('replace with a file missing categories still keeps the built-ins', async () => {
  await db.categories.add(custom)
  const file = {
    app: 'aloplanner',
    schemaVersion: 1,
    exportedAt: '',
    tables: { settings: [{ id: 'app', displayName: 'Sam' }] },
  }
  await importBackup(parseBackup(JSON.stringify(file)), 'replace')
  const names = (await listCategories()).map((c) => c.name)
  expect(names).toEqual(['Stream', 'Store', 'Commission', 'Life', 'Health'])
})

test.each([
  ['not json', 'not-json'],
  ['{"hello":1}', 'not-backup'],
  [JSON.stringify({ app: 'aloplanner', schemaVersion: SCHEMA_VERSION + 1, tables: {} }), 'too-new'],
  [JSON.stringify({ app: 'aloplanner', schemaVersion: 1, tables: { nope: [] } }), 'bad-data'],
  [
    JSON.stringify({ app: 'aloplanner', schemaVersion: 1, tables: { categories: [{}] } }),
    'bad-data',
  ],
])('rejects invalid file %#', (text, code) => {
  expect(() => parseBackup(text)).toThrow(BackupError)
  try {
    parseBackup(text)
  } catch (e) {
    expect((e as BackupError).code).toBe(code)
  }
})

test('a failed import changes nothing', async () => {
  await updateSettings({ displayName: 'Before' })
  const bad = {
    app: 'aloplanner' as const,
    schemaVersion: 1,
    exportedAt: '',
    // Skips parseBackup on purpose to force a write error mid-transaction.
    tables: { settings: [{ id: 'app', displayName: 'After' }], categories: [{ name: 'no id' }] },
  }
  await expect(importBackup(bad, 'replace')).rejects.toThrow()
  expect((await getSettings()).displayName).toBe('Before')
})
