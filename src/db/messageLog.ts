import { toLocalISO } from '../lib/dates'
import { db } from './db'
import type { MessageLog } from './types'

export async function listMessageLog(): Promise<MessageLog[]> {
  return db.messageLog.toArray()
}

export async function logMessageShown(messageId: string, now = new Date()): Promise<void> {
  await db.messageLog.put({ messageId, shownAt: toLocalISO(now) })
}
