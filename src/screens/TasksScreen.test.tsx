import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../App'
import { updateSettings } from '../db/settings'
import { addTask, addToTopThree } from '../db/tasks'
import { dayKey } from '../lib/dates'
import { useGuideStore } from '../state/guideStore'
import { useSettingsStore } from '../state/settingsStore'
import { useTaskSheet } from '../state/taskSheetStore'
import { resetDb } from '../test/db'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  useGuideStore.setState({ notice: null })
  useTaskSheet.setState({ taskId: undefined })
  await updateSettings({ onboarded: true, messageFrequency: 'high' })
})

test('add a task, put it in the Top 3, break it down; the next step shows on Today', async () => {
  window.location.hash = '#/tasks'
  const user = userEvent.setup()
  render(<App />)

  await user.type(await screen.findByLabelText('New task'), 'Rig model for a client')
  await user.click(screen.getByRole('button', { name: 'Add' }))
  const someday = await screen.findByRole('region', { name: 'Someday' })
  await user.click(await within(someday).findByRole('button', { name: 'Add to Top 3' }))

  const top = screen.getByRole('region', { name: 'Today’s Top 3' })
  await user.click(await within(top).findByRole('button', { name: 'Open Rig model for a client' }))
  const sheet = await screen.findByRole('dialog', { name: 'Task' })
  await user.type(within(sheet).getByPlaceholderText('Next small step'), 'Face params')
  await user.click(within(sheet).getByRole('button', { name: 'Add step' }))
  await user.type(within(sheet).getByPlaceholderText('Next small step'), 'Body physics')
  await user.click(within(sheet).getByRole('button', { name: 'Add step' }))
  await user.click(await within(sheet).findByRole('checkbox', { name: 'Face params' }))
  await user.click(within(sheet).getByRole('button', { name: 'Close' }))

  await user.click(screen.getByRole('link', { name: 'Back' }))
  const card = await screen.findByRole('region', { name: 'Today’s Top 3' })
  expect(await within(card).findByText('Next step: Body physics')).toBeInTheDocument()
})

test('finishing all three Top 3 tasks brings out the queen fox', async () => {
  const day = dayKey(new Date())
  for (const title of ['A', 'B', 'C']) {
    const t = await addTask(title)
    await addToTopThree(t.id, day)
  }
  window.location.hash = '#/today'
  const user = userEvent.setup()
  render(<App />)
  const card = await screen.findByRole('region', { name: 'Today’s Top 3' })
  for (const title of ['A', 'B', 'C']) {
    await user.click(await within(card).findByRole('checkbox', { name: title }))
  }
  await waitFor(() => expect(useGuideStore.getState().notice?.pose).toBe('queen'))
})
