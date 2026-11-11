import { Dexie, type EntityTable } from 'dexie'
import { BUILT_IN_CATEGORIES, DEFAULT_SETTINGS } from './defaults'
import type {
  Block,
  BrainDumpItem,
  Category,
  HealthLog,
  MessageLog,
  MetaEntry,
  Settings,
  Task,
} from './types'

/**
 * The one database. All reads and writes go through src/db/.
 *
 * Schema changes: never edit an existing version. Add a new
 * `this.version(n + 1).stores({...}).upgrade(tx => ...)` that migrates
 * existing records, and add a matching step to `migrateBackup` in
 * backup.ts so older backup files still import. Never drop or rename a
 * stored field without migrating it.
 */
export class AloplannerDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  categories!: EntityTable<Category, 'id'>
  blocks!: EntityTable<Block, 'id'>
  tasks!: EntityTable<Task, 'id'>
  brainDump!: EntityTable<BrainDumpItem, 'id'>
  healthLogs!: EntityTable<HealthLog, 'date'>
  messageLog!: EntityTable<MessageLog, 'messageId'>
  meta!: EntityTable<MetaEntry, 'key'>

  constructor(name = 'aloplanner') {
    super(name)

    // v1: Phase 0 foundation.
    this.version(1).stores({
      settings: 'id',
      categories: 'id, name',
    })

    // v2: Phase 1. New tables only, so existing data needs no migration.
    // Booleans can't be indexed in IndexedDB, so done/someday/processed are filtered in memory.
    this.version(2).stores({
      blocks: 'id, start, end, taskId',
      tasks: 'id, topThreeDate, dueDate',
      brainDump: 'id, createdAt',
      healthLogs: 'date',
      messageLog: 'messageId, shownAt',
      meta: 'key',
    })

    this.on('populate', (tx) => {
      void tx.table('settings').add(DEFAULT_SETTINGS)
      void tx.table('categories').bulkAdd(BUILT_IN_CATEGORIES)
    })
  }
}

export const db = new AloplannerDB()

/** Current schema version, written into backups. */
export const SCHEMA_VERSION = 2

/**
 * Ask the browser not to evict our data under storage pressure.
 * Best effort: some browsers ignore or deny it.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
