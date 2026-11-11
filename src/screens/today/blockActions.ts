import { extendBlock, updateBlock } from '../../db/blocks'
import type { Block } from '../../db/types'
import { todayCopy } from '../../content/today'
import { encourage } from '../../messages/encourage'
import { showNotice } from '../../state/guideStore'

export const EXTENSION_MINUTES = 10

/** Marks a block done, cheers (maybe), and always offers Undo. */
export async function completeBlock(block: Block): Promise<void> {
  await updateBlock(block.id, { status: 'done' })
  const undo = {
    label: todayCopy.undo,
    onClick: () => void updateBlock(block.id, { status: block.status }),
  }
  const shown = await encourage('block-done', { vars: { title: block.title }, actions: [undo] })
  if (!shown) {
    showNotice({
      character: 'fox',
      pose: 'happy',
      tone: 'calm',
      text: todayCopy.blockDoneFallback,
      actions: [undo],
    })
  }
}

export function canExtend(block: Block, extensionsPerBlock: number): boolean {
  return block.extensionsUsed < extensionsPerBlock
}

/** "+10 min": extends, pushes what comes next, and says what moved. */
export async function extendCurrentBlock(block: Block): Promise<void> {
  const result = await extendBlock(block.id, EXTENSION_MINUTES)
  showNotice({
    character: 'owl',
    pose: 'neutral',
    tone: 'calm',
    text: todayCopy.extended(result.moved, result.clash),
    sticky: Boolean(result.clash),
  })
}
