import { create } from 'zustand'

type TaskSheetState = {
  taskId?: string
  open: (taskId: string) => void
  close: () => void
}

export const useTaskSheet = create<TaskSheetState>((set) => ({
  open: (taskId) => set({ taskId }),
  close: () => set({ taskId: undefined }),
}))
