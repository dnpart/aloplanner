/**
 * The only place that talks to a notification API.
 * Web implementation now; a Capacitor implementation replaces `notifier`
 * in the Android app (Phase 2). UI code calls `notify()` and friends only.
 */

export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported'

export type AppNotification = {
  /** Same id replaces an earlier notification instead of stacking. */
  id: string
  title: string
  body: string
}

export interface Notifier {
  permission(): NotifyPermission
  requestPermission(): Promise<NotifyPermission>
  show(notification: AppNotification): Promise<boolean>
}

const icon = `${import.meta.env.BASE_URL}icons/icon-192.png`

export const webNotifier: Notifier = {
  permission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  },

  async requestPermission() {
    if (this.permission() === 'unsupported') return 'unsupported'
    try {
      return await Notification.requestPermission()
    } catch {
      return this.permission()
    }
  },

  async show({ id, title, body }) {
    if (this.permission() !== 'granted') return false
    try {
      // Android Chrome only allows notifications through the service worker.
      const registration = await navigator.serviceWorker?.getRegistration()
      if (registration) {
        await registration.showNotification(title, { body, tag: id, icon, badge: icon })
        return true
      }
      new Notification(title, { body, tag: id, icon })
      return true
    } catch {
      return false
    }
  },
}

let notifier: Notifier = webNotifier

/** Swap the implementation (Capacitor later, fakes in tests). */
export function setNotifier(next: Notifier): void {
  notifier = next
}

export function notificationPermission(): NotifyPermission {
  return notifier.permission()
}

export function requestNotificationPermission(): Promise<NotifyPermission> {
  return notifier.requestPermission()
}

/**
 * Sends a system notification when the app isn't on screen. When it is
 * visible, the in-app alert is enough, so nothing is sent.
 * Returns true if a system notification went out.
 */
export async function notify(notification: AppNotification): Promise<boolean> {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return false
  return notifier.show(notification)
}
