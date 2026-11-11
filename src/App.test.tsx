import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from './App'
import { updateSettings } from './db/settings'
import { useSettingsStore } from './state/settingsStore'
import { resetDb } from './test/db'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  window.location.hash = ''
})

test('shows Today with five nav items and moves between sections', async () => {
  await updateSettings({ onboarded: true, displayName: 'Sam' })
  render(<App />)

  const nav = await screen.findByRole('navigation', { name: 'Main' })
  const links = nav.querySelectorAll('a')
  expect([...links].map((a) => a.textContent)).toEqual(['Today', 'Plan', 'Stream', 'Work', 'Play'])
  expect(await screen.findByRole('heading', { level: 1, name: /Sam/ })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('link', { name: 'Plan' }))
  expect(await screen.findByRole('heading', { name: 'Plan' })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('link', { name: 'Today' }))
  await userEvent.click(await screen.findByRole('link', { name: 'Settings' }))
  expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
})

test('applies the saved text size to the whole page', async () => {
  await updateSettings({ onboarded: true, textScale: 1.3 })
  render(<App />)
  await screen.findByRole('navigation', { name: 'Main' })
  expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.3')
})
