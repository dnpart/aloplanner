import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { App } from '../App'
import { getSettings } from '../db/settings'
import { useSettingsStore } from '../state/settingsStore'
import { resetDb } from '../test/db'

beforeEach(async () => {
  await resetDb()
  useSettingsStore.setState({ settings: null })
  window.location.hash = ''
})

test('first run walks through setup, saves on this device, then opens Today', async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(await screen.findByRole('heading', { name: 'Welcome to Aloplanner' })).toBeInTheDocument()
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('What should we call you?'), '  Sam ')
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('radio', { name: /Largest/ }))
  expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.3')
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: 'Less sleep' }))
  expect(screen.getByText('7.5 hours')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: 'More commute' }))
  await user.click(screen.getByRole('button', { name: 'Back' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('25 min')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next' }))

  await user.click(screen.getByRole('button', { name: 'Let’s go' }))
  expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { level: 1, name: /Sam$/ })).toBeInTheDocument()

  const settings = await getSettings()
  expect(settings).toMatchObject({
    onboarded: true,
    displayName: 'Sam',
    textScale: 1.3,
    sleepHours: 7.5,
    getReadyMinutes: 45,
    commuteMinutes: 25,
  })
})
