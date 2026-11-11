import { beforeEach, expect, test } from 'vitest'
import { currentMeal } from '../content/health'
import { resetDb } from '../test/db'
import { changeWater, getHealthLog, setMeal } from './health'

beforeEach(resetDb)

test('water counts up and never below zero; meals check off per day', async () => {
  await changeWater('2026-11-10', 1)
  await changeWater('2026-11-10', 1)
  await changeWater('2026-11-10', -5)
  await changeWater('2026-11-10', 1)
  await setMeal('2026-11-10', 'dinner', true)
  expect(await getHealthLog('2026-11-10')).toEqual({
    date: '2026-11-10',
    water: 1,
    meals: { breakfast: false, lunch: false, dinner: true },
  })
  expect((await getHealthLog('2026-11-11')).water).toBe(0)
})

test('the meal shown depends on the time of day', () => {
  expect([7, 12, 19].map(currentMeal)).toEqual(['breakfast', 'lunch', 'dinner'])
})
