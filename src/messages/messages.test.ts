import { expect, test } from 'vitest'
import { characterAlt } from '../content/characters'
import { toLocalISO } from '../lib/dates'
import { fillMessage, messageBank } from './bank'
import { pickMessage, shouldShow } from './pick'
import { MESSAGE_CONTEXTS } from './types'

test('the bank follows the writing rules', () => {
  const ids = new Set<string>()
  for (const m of messageBank) {
    expect(ids.has(m.id), m.id).toBe(false)
    ids.add(m.id)
    expect(m.contexts.length, m.id).toBe(1)
    expect(MESSAGE_CONTEXTS, m.id).toContain(m.contexts[0])
    expect(Object.keys(characterAlt[m.character]), m.id).toContain(m.pose)
    expect(m.text.length, m.id).toBeLessThanOrEqual(110)
    expect(m.text, m.id).not.toMatch(/\b[A-Z]{3,}\b/) // no all-caps words
    expect(m.text, m.id).not.toMatch(/streak|fail|you should have|wasted?/i)
    for (const placeholder of m.text.match(/\{\w+\}/g) ?? []) {
      expect(['{title}', '{minutes}'], m.id).toContain(placeholder)
    }
  }
})

test.each(MESSAGE_CONTEXTS)('context %s has at least 15 messages', (context) => {
  expect(messageBank.filter((m) => m.contexts.includes(context)).length).toBeGreaterThanOrEqual(15)
})

test('stressful contexts are always calm, and big wins get the queen fox', () => {
  for (const m of messageBank.filter((x) => x.contexts.includes('overwhelm'))) {
    expect(m.tone, m.id).toBe('calm')
    expect(m.text, m.id).not.toContain('!')
  }
  for (const m of messageBank.filter((x) => x.contexts.includes('top3-done'))) {
    expect(m.pose, m.id).toBe('queen')
  }
})

test('check-ins name the block and the minutes', () => {
  for (const m of messageBank.filter((x) => x.contexts.includes('check-in'))) {
    expect(m.text, m.id).toContain('{title}')
    expect(m.text, m.id).toContain('{minutes}')
  }
})

test('fills placeholders', () => {
  expect(
    fillMessage('{minutes} min on {title}. Still the plan?', { title: 'rigging', minutes: 50 }),
  ).toBe('50 min on rigging. Still the plan?')
})

const now = new Date('2026-11-10T12:00:00')
const daysAgo = (d: number) => {
  return toLocalISO(new Date(now.getTime() - d * 86_400_000))
}

test('never repeats a message within 7 days', () => {
  const pool = messageBank.filter((m) => m.contexts.includes('came-back'))
  const log = pool.slice(1).map((m) => ({ messageId: m.id, shownAt: daysAgo(1) }))
  for (let i = 0; i < 20; i++) {
    expect(pickMessage(messageBank, 'came-back', log, now)?.id).toBe(pool[0]!.id)
  }
})

test('when everything was shown recently, picks the one shown longest ago', () => {
  const pool = messageBank.filter((m) => m.contexts.includes('came-back'))
  const log = pool.map((m, i) => ({ messageId: m.id, shownAt: daysAgo(i === 3 ? 6 : 1) }))
  expect(pickMessage(messageBank, 'came-back', log, now)?.id).toBe(pool[3]!.id)
})

test('optional encouragement follows the frequency setting; alerts always show', () => {
  expect(shouldShow('task-done', 'low', () => 0.5)).toBe(false)
  expect(shouldShow('task-done', 'high', () => 0.99)).toBe(true)
  expect(shouldShow('check-in', 'low', () => 0.99)).toBe(true)
})
