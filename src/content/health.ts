import type { Meal } from '../db/types'

export const healthCopy = {
  water: 'Water',
  waterCount: (n: number, goal: number) => `${n} of ${goal}`,
  addWater: 'Add a glass of water',
  removeWater: 'Remove a glass of water',
  meals: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' } satisfies Record<
    Meal,
    string
  >,
  notYet: 'Not yet',
  eaten: 'Eaten',
  ate: 'Ate',
  ateLabel: (meal: string) => `I ate ${meal.toLowerCase()}`,
  earlier: (items: string) => `Earlier: ${items}`,
  mealDone: (meal: string) => `${meal} ✓`,
  mealMissing: (meal: string) => `${meal} not yet`,
}

/** The meal that matters right now. */
export function currentMeal(hour: number): Meal {
  if (hour < 11) return 'breakfast'
  if (hour < 16) return 'lunch'
  return 'dinner'
}
