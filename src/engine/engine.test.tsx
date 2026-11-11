import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../App'
import { getBlock, newBlock, saveBlock } from '../db/blocks'
import { updateSettings } from '../db/settings'
import { toLocalISO } from '../lib/dates'
import { useGuideStore } from '../state/guideStore'
import { useSettingsStore } from '../state/settingsStore'
import { useTimeCheck } from '../state/timeCheckStore'
import { resetDb } from '../test/db'
import { runTick } from './useTimeEngine'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  useGuideStore.setState({ notice: null })
  useTimeCheck.setState({ blockId: undefined, message: undefined })
  window.location.hash = '#/today'
  await updateSettings({ onboarded: true })
})

const fromNow = (m: number) => toLocalISO(new Date(Date.now() + m * 60_000))

test('10 minutes before the end, the Time Check opens and saves a note for next time', async () => {
  const block = newBlock({
    title: 'Rig arm physics',
    categoryId: 'commission',
    start: fromNow(-50),
    end: fromNow(9),
  })
  const next = newBlock({
    title: 'Post clip',
    categoryId: 'stream',
    start: block.end,
    end: fromNow(30),
  })
  await saveBlock(block)
  await saveBlock(next)
  const user = userEvent.setup()
  render(<App />)

  const dialog = await screen.findByRole('dialog', { name: /minutes and \d+ seconds left/ })
  expect(within(dialog).getByText(/left on Rig arm physics/)).toBeInTheDocument()
  expect(await within(dialog).findByText('Post clip')).toBeInTheDocument()
  expect(within(dialog).getByLabelText('Save the Live2D file')).toBeInTheDocument()

  await user.type(within(dialog).getByLabelText(/where I left off/), 'Left arm done')
  await user.click(within(dialog).getByRole('button', { name: 'Start wrapping up' }))
  await waitFor(async () => expect((await getBlock(block.id))?.leftOffNote).toBe('Left arm done'))
  expect(useTimeCheck.getState().blockId).toBeUndefined()
})

test('a check-in names the block and the minutes, and fires only once', async () => {
  const block = newBlock({
    title: 'Rig arm physics',
    categoryId: 'commission',
    start: fromNow(-20.5),
    end: fromNow(40),
  })
  await saveBlock(block)
  render(<App />)
  expect(
    await screen.findByText(/Rig arm physics/, { selector: '.guide-toast p' }),
  ).toHaveTextContent('20')
  await waitFor(async () => expect((await getBlock(block.id))?.alertsFired).toContain('checkin-20'))

  useGuideStore.setState({ notice: null })
  await runTick(new Date())
  expect(useGuideStore.getState().notice).toBeNull()
})

test('when a block ends unanswered, the fox nudges once', async () => {
  const block = newBlock({
    title: 'Rig arm physics',
    categoryId: 'commission',
    start: fromNow(-60),
    end: fromNow(-1),
    status: 'active',
    alertsFired: ['checkin-20', 'wrap', 'final'],
  })
  await saveBlock(block)
  await runTick(new Date())
  expect(useGuideStore.getState().notice).toMatchObject({ character: 'fox' })
  expect(useGuideStore.getState().notice?.text).toContain('Rig arm physics')

  useGuideStore.setState({ notice: null })
  await runTick(new Date())
  expect(useGuideStore.getState().notice).toBeNull()
})
