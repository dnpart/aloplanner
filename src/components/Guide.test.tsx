import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Guide } from './Guide'

test('shows the chosen pose with alt text and the message', () => {
  render(<Guide character="owl" pose="bowtie" message="Time blocks need breathing room." />)
  expect(screen.getByRole('img', { name: 'Owl in a bow tie, teaching' })).toBeInTheDocument()
  expect(screen.getByText('Time blocks need breathing room.')).toBeInTheDocument()
})

test('defaults to the neutral pose', () => {
  render(<Guide character="fox" />)
  expect(screen.getByRole('img', { name: 'Fox' })).toBeInTheDocument()
})

test('renders actions as buttons', async () => {
  const onClick = vi.fn()
  render(
    <Guide
      character="fox"
      pose="happy"
      message="Nice."
      actions={[{ label: 'Pick now', onClick }]}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Pick now' }))
  expect(onClick).toHaveBeenCalledOnce()
})
