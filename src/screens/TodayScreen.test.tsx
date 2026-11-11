import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../App'
import { listBlocksForDay, newBlock, saveBlock } from '../db/blocks'
import { updateSettings } from '../db/settings'
import { dayKey, toLocalISO } from '../lib/dates'
import { useGuideStore } from '../state/guideStore'
import { useSettingsStore } from '../state/settingsStore'
import { resetDb } from '../test/db'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  useGuideStore.setState({ notice: null })
  window.location.hash = '#/today'
  await updateSettings({ onboarded: true })
})

const minutesFromNow = (m: number) => toLocalISO(new Date(Date.now() + m * 60_000))

test('shows the current block with time left, and +10 min pushes the next block', async () => {
  const current = newBlock({
    title: 'Rig arm physics',
    categoryId: 'commission',
    start: minutesFromNow(-30),
    end: minutesFromNow(25),
  })
  const after = newBlock({
    title: 'Post clip',
    categoryId: 'stream',
    start: current.end,
    end: minutesFromNow(40),
  })
  await saveBlock(current)
  await saveBlock(after)
  const user = userEvent.setup()
  render(<App />)

  const card = await screen.findByRole('region', { name: 'Rig arm physics' })
  expect(within(card).getByRole('img', { name: /minutes left of 55/ })).toBeInTheDocument()
  expect(within(card).getByText('Commission')).toBeInTheDocument()

  await user.click(within(card).getByRole('button', { name: '+10 min' }))
  expect(await screen.findByText(/Added 10 minutes\. Post clip moves to/)).toBeInTheDocument()
  // One extension per block by default.
  await waitFor(() => expect(within(card).getByRole('button', { name: '+10 min' })).toBeDisabled())
})

test('adds a block from the Today screen', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Add a block' }))
  await user.type(screen.getByLabelText('What is it?'), 'Edit clips')
  await user.click(await screen.findByRole('radio', { name: 'Stream' }))
  await user.click(screen.getByRole('button', { name: 'Save' }))

  const blocks = await listBlocksForDay(dayKey(new Date()))
  expect(blocks.map((b) => [b.title, b.categoryId])).toEqual([['Edit clips', 'stream']])
  expect((await screen.findAllByRole('button', { name: /Edit clips/ })).length).toBeGreaterThan(0)
})
