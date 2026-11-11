import { create } from 'zustand'
import type { Block } from '../db/types'

type BlockSheetState = {
  open: boolean
  /** Editing an existing block. */
  blockId?: string
  /** Prefill for a new block (e.g. from the brain dump inbox). */
  draft?: Partial<Block>
  /** Called after a new block is saved. */
  onSaved?: (block: Block) => void
  openNew: (draft?: Partial<Block>, onSaved?: (block: Block) => void) => void
  openEdit: (blockId: string) => void
  close: () => void
}

export const useBlockSheet = create<BlockSheetState>((set) => ({
  open: false,
  openNew: (draft, onSaved) => set({ open: true, blockId: undefined, draft, onSaved }),
  openEdit: (blockId) => set({ open: true, blockId, draft: undefined, onSaved: undefined }),
  close: () => set({ open: false, blockId: undefined, draft: undefined, onSaved: undefined }),
}))
