import { newId, toLocalISOPrecise } from '../lib/dates'
import { db } from './db'
import type { BrainDumpItem } from './types'

export async function addBrainDump(text: string, now = new Date()): Promise<BrainDumpItem> {
  const item: BrainDumpItem = {
    id: newId(),
    text: text.trim(),
    createdAt: toLocalISOPrecise(now),
    processed: false,
  }
  await db.brainDump.add(item)
  return item
}

export async function listInbox(): Promise<BrainDumpItem[]> {
  const rows = await db.brainDump.orderBy('createdAt').toArray()
  return rows.filter((i) => !i.processed)
}

export async function markProcessed(id: string): Promise<void> {
  await db.brainDump.update(id, { processed: true })
}

export async function deleteBrainDump(id: string): Promise<void> {
  await db.brainDump.delete(id)
}
