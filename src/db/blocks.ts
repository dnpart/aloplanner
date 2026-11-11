import { addMinutesISO, dayBounds, fromLocalISO, newId } from '../lib/dates'
import { db } from './db'
import type { Block } from './types'

export type BlockDraft = Pick<Block, 'title' | 'categoryId' | 'start' | 'end'> &
  Partial<Omit<Block, 'id' | 'title' | 'categoryId' | 'start' | 'end'>>

export function newBlock(draft: BlockDraft): Block {
  return {
    allDay: false,
    notes: '',
    kind: 'block',
    recurrence: null,
    reminders: [],
    checkIns: true,
    leftOffNote: '',
    status: 'planned',
    extensionsUsed: 0,
    alertsFired: [],
    ...draft,
    id: newId(),
  }
}

const byStart = (a: Block, b: Block) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end)

/** Blocks that touch the given day, sorted by start. */
export async function listBlocksForDay(day: string): Promise<Block[]> {
  const { start, end } = dayBounds(day)
  // Blocks can start the day before and run past midnight.
  const from = dayBounds(addMinutesISO(start, -24 * 60).slice(0, 10)).start
  const rows = await db.blocks.where('start').between(from, end, true, false).toArray()
  return rows.filter((b) => b.end > start).sort(byStart)
}

export function getBlock(id: string) {
  return db.blocks.get(id)
}

export async function saveBlock(block: Block): Promise<void> {
  await db.blocks.put(block)
}

export async function updateBlock(id: string, patch: Partial<Omit<Block, 'id'>>): Promise<void> {
  await db.blocks.update(id, patch)
}

export async function deleteBlock(id: string): Promise<void> {
  await db.blocks.delete(id)
}

export function isOpen(block: Block): boolean {
  return block.status !== 'done' && block.status !== 'skipped' && !block.allDay
}

/** The block happening now. If blocks overlap, the one that started last wins. */
export function currentBlock(blocks: Block[], now: Date): Block | undefined {
  const t = now.getTime()
  return blocks
    .filter(
      (b) => isOpen(b) && fromLocalISO(b.start).getTime() <= t && t < fromLocalISO(b.end).getTime(),
    )
    .sort((a, b) => b.start.localeCompare(a.start))[0]
}

/** The next open block that starts after now (or after the current block). */
export function nextBlock(blocks: Block[], now: Date, after?: Block): Block | undefined {
  const t = now.getTime()
  return blocks
    .filter((b) => isOpen(b) && b.id !== after?.id && fromLocalISO(b.start).getTime() > t)
    .sort(byStart)[0]
}

export type ExtendResult = {
  block: Block
  /** Blocks pushed later, with their new start. */
  moved: Block[]
  /** A fixed appointment the extended block now runs into. */
  clash?: Block
}

/**
 * Adds time to a block and pushes the blocks after it so nothing overlaps.
 * Appointments are fixed: pushing stops there and the clash is reported.
 */
export async function extendBlock(id: string, minutes: number): Promise<ExtendResult> {
  return db.transaction('rw', db.blocks, async () => {
    const block = await db.blocks.get(id)
    if (!block) throw new Error(`No block ${id}`)
    const updated: Block = {
      ...block,
      end: addMinutesISO(block.end, minutes),
      extensionsUsed: block.extensionsUsed + 1,
      // Warnings tied to the old end time should fire again for the new one.
      alertsFired: block.alertsFired.filter((k) => !/^(wrap|final|end)/.test(k)),
    }
    await db.blocks.put(updated)

    const day = block.start.slice(0, 10)
    const later = (await listBlocksForDay(day)).filter(
      (b) => b.id !== id && isOpen(b) && b.start >= block.start,
    )
    const moved: Block[] = []
    let clash: Block | undefined
    let cursor = updated.end
    for (const b of later) {
      if (b.start >= cursor) break
      if (b.kind === 'appointment') {
        clash = b
        break
      }
      const shift = (fromLocalISO(cursor).getTime() - fromLocalISO(b.start).getTime()) / 60_000
      const pushed = { ...b, start: cursor, end: addMinutesISO(b.end, shift) }
      await db.blocks.put(pushed)
      moved.push(pushed)
      cursor = pushed.end
    }
    return { block: updated, moved, clash }
  })
}

/**
 * The most recent "where I left off" note for the same work: the same
 * linked task, or the same title if there is no task.
 */
export async function previousLeftOffNote(block: Block): Promise<Block | undefined> {
  const candidates = block.taskId
    ? await db.blocks.where('taskId').equals(block.taskId).toArray()
    : await db.blocks
        .filter((b) => b.title.trim().toLowerCase() === block.title.trim().toLowerCase())
        .toArray()
  return candidates
    .filter((b) => b.id !== block.id && b.leftOffNote.trim() && b.start < block.start)
    .sort((a, b) => b.start.localeCompare(a.start))[0]
}
