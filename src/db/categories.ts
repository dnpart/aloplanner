import { db } from './db'
import type { Category } from './types'

/** Built-ins first, in their seeded order, then custom categories by name. */
export async function listCategories(): Promise<Category[]> {
  const all = await db.categories.toArray()
  const builtInOrder = ['stream', 'store', 'commission', 'life', 'health']
  const rank = (c: Category) => {
    const i = builtInOrder.indexOf(c.id)
    return i === -1 ? builtInOrder.length : i
  }
  return all.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}
