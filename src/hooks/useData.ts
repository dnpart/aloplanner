import { useLiveQuery } from 'dexie-react-hooks'
import { listBlocksForDay } from '../db/blocks'
import { listCategories } from '../db/categories'
import type { Block, Category } from '../db/types'

/** Live list of today's blocks. Undefined while loading. */
export function useBlocksForDay(day: string): Block[] | undefined {
  return useLiveQuery(() => listBlocksForDay(day), [day])
}

export function useCategories(): Category[] {
  return useLiveQuery(listCategories, []) ?? []
}

export function useCategoryMap(): Map<string, Category> {
  const categories = useCategories()
  return new Map(categories.map((c) => [c.id, c]))
}
