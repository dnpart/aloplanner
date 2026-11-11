import { db } from './db'
import type { HealthLog, Meal } from './types'

export function emptyHealthLog(date: string): HealthLog {
  return { date, water: 0, meals: { breakfast: false, lunch: false, dinner: false } }
}

export async function getHealthLog(date: string): Promise<HealthLog> {
  return (await db.healthLogs.get(date)) ?? emptyHealthLog(date)
}

export async function changeWater(date: string, delta: number): Promise<void> {
  await db.transaction('rw', db.healthLogs, async () => {
    const log = await getHealthLog(date)
    await db.healthLogs.put({ ...log, water: Math.max(0, log.water + delta) })
  })
}

export async function setMeal(date: string, meal: Meal, eaten: boolean): Promise<void> {
  await db.transaction('rw', db.healthLogs, async () => {
    const log = await getHealthLog(date)
    await db.healthLogs.put({ ...log, meals: { ...log.meals, [meal]: eaten } })
  })
}
