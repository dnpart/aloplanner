import { format } from 'date-fns'
import type { Table } from 'dexie'
import { db, SCHEMA_VERSION } from './db'
import { BUILT_IN_CATEGORIES } from './defaults'

export const BACKUP_APP_ID = 'aloplanner'

export type BackupFile = {
  app: typeof BACKUP_APP_ID
  schemaVersion: number
  exportedAt: string
  tables: Record<string, Record<string, unknown>[]>
}

export type BackupErrorCode = 'not-json' | 'not-backup' | 'too-new' | 'bad-data'

export class BackupError extends Error {
  readonly code: BackupErrorCode
  constructor(code: BackupErrorCode, detail?: string) {
    super(detail ? `${code}: ${detail}` : code)
    this.code = code
  }
}

type Row = Record<string, unknown>
type RowCheck = (row: Row) => boolean

/**
 * Per-table checks for imported rows. Add one for every new table.
 * Tables without a check only need their primary key.
 */
const rowChecks: Record<string, RowCheck> = {
  settings: (r) => r.id === 'app',
  categories: (r) =>
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.color === 'string' &&
    typeof r.builtIn === 'boolean',
}

/** Snapshot of every table, so new tables are included automatically. */
export async function exportBackup(now = new Date()): Promise<BackupFile> {
  const tables: BackupFile['tables'] = {}
  await db.transaction('r', db.tables, async () => {
    for (const table of db.tables) {
      tables[table.name] = (await table.toArray()) as Row[]
    }
  })
  return {
    app: BACKUP_APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    tables,
  }
}

export function backupFileName(now = new Date()): string {
  return `aloplanner-backup-${format(now, 'yyyy-MM-dd-HHmm')}.json`
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2)
}

/** Parses and validates a backup file's text. Throws BackupError. */
export function parseBackup(text: string): BackupFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new BackupError('not-json')
  }
  if (!isObject(data) || data.app !== BACKUP_APP_ID || !isObject(data.tables)) {
    throw new BackupError('not-backup')
  }
  const version = data.schemaVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    throw new BackupError('not-backup')
  }
  if (version > SCHEMA_VERSION) throw new BackupError('too-new')

  const migrated = migrateBackup({
    app: BACKUP_APP_ID,
    schemaVersion: version,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    tables: data.tables as BackupFile['tables'],
  })

  const known = new Map(db.tables.map((t) => [t.name, t]))
  for (const [name, rows] of Object.entries(migrated.tables)) {
    const table = known.get(name)
    if (!table) throw new BackupError('bad-data', `unknown table ${name}`)
    if (!Array.isArray(rows)) throw new BackupError('bad-data', `${name} is not a list`)
    const key = primaryKey(table)
    const check = rowChecks[name]
    for (const row of rows) {
      if (!isObject(row) || row[key] === undefined || (check && !check(row))) {
        throw new BackupError('bad-data', `bad row in ${name}`)
      }
    }
  }
  return migrated
}

/**
 * Brings an older backup up to the current schema. Add a step here for
 * every Dexie version bump that changes stored data.
 */
export function migrateBackup(backup: BackupFile): BackupFile {
  const result = { ...backup, tables: { ...backup.tables } }
  // Example for the future:
  // if (result.schemaVersion < 2) { result.tables.tasks = []; result.schemaVersion = 2 }
  result.schemaVersion = SCHEMA_VERSION
  return result
}

/** Row counts per table, for the import preview. */
export function countRows(backup: BackupFile): Record<string, number> {
  return Object.fromEntries(
    Object.entries(backup.tables).map(([name, rows]) => [name, rows.length]),
  )
}

export type ImportMode = 'replace' | 'merge'

/**
 * Writes a validated backup in one transaction: either everything lands
 * or nothing changes.
 * - replace: clears every table first.
 * - merge: adds new records; records with the same id are overwritten by the file.
 */
export async function importBackup(backup: BackupFile, mode: ImportMode): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    if (mode === 'replace') {
      for (const table of db.tables) await table.clear()
    }
    for (const [name, rows] of Object.entries(backup.tables)) {
      await db.table(name).bulkPut(rows)
    }
    // Built-in categories must always exist.
    const existing = new Set(await db.categories.toCollection().primaryKeys())
    const missing = BUILT_IN_CATEGORIES.filter((c) => !existing.has(c.id))
    if (missing.length) await db.categories.bulkAdd(missing)
  })
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function primaryKey(table: Table): string {
  const keyPath = table.schema.primKey.keyPath
  return Array.isArray(keyPath) ? (keyPath[0] ?? 'id') : (keyPath ?? 'id')
}
