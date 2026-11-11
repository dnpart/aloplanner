import { create } from 'zustand'

type TimeCheckState = {
  blockId?: string
  message?: string
  open: (blockId: string, message: string) => void
  close: (blockId?: string) => void
}

/** Which block's full-screen Time Check is showing, if any. */
export const useTimeCheck = create<TimeCheckState>((set) => ({
  open: (blockId, message) => set({ blockId, message }),
  close: (blockId) =>
    set((s) => (blockId && s.blockId !== blockId ? s : { blockId: undefined, message: undefined })),
}))
