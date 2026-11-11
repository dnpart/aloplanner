import { expect, test } from 'vitest'
import { collectReadableText } from './speech'

test('reads text blocks and skips controls, nav, and hidden content', () => {
  const root = document.createElement('main')
  root.innerHTML = `
    <h1>Today</h1>
    <nav><a>Plan</a></nav>
    <button>Settings</button>
    <p>Rig arm physics</p>
    <span aria-hidden="true">decor</span>
    <div data-read-skip>skip me</div>
    <label>Your name <input value="x"></label>
  `
  expect(collectReadableText(root)).toBe('Today\nRig arm physics\nYour name')
})
