import { create } from 'zustand'
import type { GuideAction } from '../components/Guide'
import type { Message } from '../messages/types'

export type GuideNotice = {
  /** Unique per showing. */
  key: string
  character: Message['character']
  pose: Message['pose']
  text: string
  tone: Message['tone']
  actions?: GuideAction[]
  /** Stays until dismissed (used for check-ins and calm messages). */
  sticky?: boolean
}

type GuideState = {
  notice: GuideNotice | null
  show: (notice: GuideNotice) => void
  dismiss: (key?: string) => void
}

/** The one speech bubble that pops up over any screen. */
export const useGuideStore = create<GuideState>((set) => ({
  notice: null,
  show: (notice) => set({ notice }),
  dismiss: (key) => set((s) => (key && s.notice?.key !== key ? s : { notice: null })),
}))
