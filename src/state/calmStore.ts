import { create } from 'zustand'
import type { Message } from '../messages/types'

type CalmMessage = Pick<Message, 'character' | 'pose'> & { text: string }

type CalmState = {
  /** "Too much" mode: only the current block and one next step. */
  calm: boolean
  message?: CalmMessage
  enter: (message?: CalmMessage) => void
  exit: () => void
}

export const useCalm = create<CalmState>((set) => ({
  calm: false,
  enter: (message) => set({ calm: true, message }),
  exit: () => set({ calm: false, message: undefined }),
}))
