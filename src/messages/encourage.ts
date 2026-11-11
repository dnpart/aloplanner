import { listMessageLog, logMessageShown } from '../db/messageLog'
import { getSettings } from '../db/settings'
import { notify } from '../platform/notify'
import { useGuideStore, type GuideNotice } from '../state/guideStore'
import { fillMessage, messageBank } from './bank'
import { pickMessage, shouldShow } from './pick'
import type { MessageContext, MessageVars } from './types'

type Options = {
  vars?: MessageVars
  actions?: GuideNotice['actions']
  sticky?: boolean
  /** Also send a system notification if the app is in the background. */
  notification?: { id: string; title: string }
  /** Show it in the bubble (default) or only return it, e.g. for a full screen. */
  display?: 'bubble' | 'none'
  now?: Date
}

export type ShownMessage = GuideNotice & { messageId: string }

let counter = 0

/**
 * Picks a message for a real event, logs it so it won't repeat for 7 days,
 * and shows it. Returns undefined when the frequency setting skips it.
 */
export async function encourage(
  context: MessageContext,
  options: Options = {},
): Promise<ShownMessage | undefined> {
  const now = options.now ?? new Date()
  const settings = await getSettings()
  if (!shouldShow(context, settings.messageFrequency)) return undefined
  const message = pickMessage(messageBank, context, await listMessageLog(), now)
  if (!message) return undefined
  await logMessageShown(message.id, now)

  const shown: ShownMessage = {
    key: `${message.id}-${++counter}`,
    messageId: message.id,
    character: message.character,
    pose: message.pose,
    tone: message.tone,
    text: fillMessage(message.text, options.vars),
    actions: options.actions,
    sticky: options.sticky ?? message.tone === 'calm',
  }
  if (options.display !== 'none') useGuideStore.getState().show(shown)
  if (options.notification) {
    void notify({
      id: options.notification.id,
      title: options.notification.title,
      body: shown.text,
    })
  }
  return shown
}
