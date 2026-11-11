import { create } from 'zustand'

type BrainDumpState = {
  open: boolean
  show: () => void
  close: () => void
}

export const useBrainDump = create<BrainDumpState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  close: () => set({ open: false }),
}))
