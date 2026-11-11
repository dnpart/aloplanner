import { db } from './db'

export type MetaKey = 'lastActiveAt'

export async function getMeta(key: MetaKey): Promise<string | undefined> {
  return (await db.meta.get(key))?.value
}

export async function setMeta(key: MetaKey, value: string): Promise<void> {
  await db.meta.put({ key, value })
}
