import { afterEach, expect, test, vi } from 'vitest'
import { notify, setNotifier, webNotifier, type Notifier } from './notify'

afterEach(() => {
  setNotifier(webNotifier)
  vi.restoreAllMocks()
})

function fakeNotifier() {
  const shown: string[] = []
  const notifier: Notifier = {
    permission: () => 'granted',
    requestPermission: async () => 'granted',
    show: async (n) => {
      shown.push(n.title)
      return true
    },
  }
  return { notifier, shown }
}

test('does not send a system notification while the app is on screen', async () => {
  const { notifier, shown } = fakeNotifier()
  setNotifier(notifier)
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  expect(await notify({ id: 'a', title: 'Time check', body: '' })).toBe(false)
  expect(shown).toEqual([])
})

test('sends one when the app is in the background', async () => {
  const { notifier, shown } = fakeNotifier()
  setNotifier(notifier)
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
  expect(await notify({ id: 'a', title: 'Time check', body: '' })).toBe(true)
  expect(shown).toEqual(['Time check'])
})

test('the web notifier reports unsupported when the browser has no Notification API', () => {
  expect(webNotifier.permission()).toBe('unsupported')
})
