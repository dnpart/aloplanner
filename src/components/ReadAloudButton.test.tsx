import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { ReadAloudButton } from './ReadAloudButton'

afterEach(() => {
  vi.unstubAllGlobals()
  // @ts-expect-error test cleanup of a stubbed browser API
  delete window.speechSynthesis
})

test('is hidden when speech is not supported', () => {
  const ref = createRef<HTMLElement>()
  const { container } = render(<ReadAloudButton target={ref} />)
  expect(container).toBeEmptyDOMElement()
})

test('speaks the screen text and toggles to stop', async () => {
  const spoken: string[] = []
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string
      constructor(text: string) {
        this.text = text
      }
    },
  )
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { speak: (u: { text: string }) => spoken.push(u.text), cancel: vi.fn() },
  })

  const main = document.createElement('main')
  main.innerHTML = '<h1>Plan</h1><p>Coming soon.</p>'
  document.body.append(main)
  const ref = { current: main }

  render(<ReadAloudButton target={ref} />)
  await userEvent.click(screen.getByRole('button', { name: 'Read this screen aloud' }))
  expect(spoken).toEqual(['Plan\nComing soon.'])
  expect(screen.getByRole('button', { name: 'Stop reading' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Stop reading' }))
  expect(screen.getByRole('button', { name: 'Read this screen aloud' })).toBeInTheDocument()
  main.remove()
})
