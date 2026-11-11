import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { exportBackup, serializeBackup } from '../../db/backup'
import { getSettings, updateSettings } from '../../db/settings'
import { resetDb } from '../../test/db'
import { BackupSection } from './BackupSection'

beforeEach(resetDb)

test('previews a backup file, then replaces after confirming', async () => {
  await updateSettings({ displayName: 'From file' })
  const text = serializeBackup(await exportBackup(new Date('2026-03-04T10:00:00')))
  await updateSettings({ displayName: 'On device' })

  render(<BackupSection />)
  const file = new File([text], 'backup.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText('Choose backup file'), file)

  expect(await screen.findByText('This backup is from Mar 4, 2026. It has:')).toBeInTheDocument()
  expect(screen.getByText('1 settings record')).toBeInTheDocument()
  expect(screen.getByText('5 categories')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Replace everything' }))
  await userEvent.click(screen.getByRole('button', { name: 'Yes, replace' }))
  expect(await screen.findByText(/Restored/)).toBeInTheDocument()
  expect((await getSettings()).displayName).toBe('From file')
})

test('explains a file that is not a backup and changes nothing', async () => {
  await updateSettings({ displayName: 'On device' })
  render(<BackupSection />)
  const file = new File(['{"hello":1}'], 'x.json', { type: 'application/json' })
  await userEvent.upload(screen.getByLabelText('Choose backup file'), file)
  expect(await screen.findByText('That file isn’t an Aloplanner backup.')).toBeInTheDocument()
  expect((await getSettings()).displayName).toBe('On device')
})
