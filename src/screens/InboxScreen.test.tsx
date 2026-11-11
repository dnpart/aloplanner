import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../App'
import { listInbox } from '../db/brainDump'
import { updateSettings } from '../db/settings'
import { listTasks } from '../db/tasks'
import { useBrainDump } from '../state/brainDumpStore'
import { useGuideStore } from '../state/guideStore'
import { useSettingsStore } from '../state/settingsStore'
import { resetDb } from '../test/db'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  useGuideStore.setState({ notice: null })
  useBrainDump.setState({ open: false })
  window.location.hash = '#/today'
  await updateSettings({ onboarded: true })
})

test('brain dump one line, then sort it into a task from the inbox', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click((await screen.findAllByRole('button', { name: 'Brain dump' }))[0]!)
  await user.type(screen.getByLabelText('What’s on your mind?'), 'Buy new mic foam{Enter}')
  expect(await screen.findByText('Saved to your inbox.')).toBeInTheDocument()

  await user.click(await screen.findByRole('link', { name: /Brain dump inbox · 1 to sort/ }))
  expect(await screen.findByText('Buy new mic foam')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Make a task' }))

  await waitFor(async () => expect(await listInbox()).toEqual([]))
  expect((await listTasks()).map((t) => [t.title, t.someday])).toEqual([['Buy new mic foam', true]])
  expect(
    await screen.findByText('Inbox is empty. Your brain dump is all sorted.'),
  ).toBeInTheDocument()
})
