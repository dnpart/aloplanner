import { useLiveQuery } from 'dexie-react-hooks'
import { CheckIcon, MinusIcon, PlusIcon } from '../../components/icons'
import { currentMeal, healthCopy as copy } from '../../content/health'
import { changeWater, emptyHealthLog, getHealthLog, setMeal } from '../../db/health'
import type { Meal } from '../../db/types'

const order: Meal[] = ['breakfast', 'lunch', 'dinner']

/** Water counter and a check-off for the current meal. */
export function HealthCard({
  day,
  hour,
  waterGoal,
}: {
  day: string
  hour: number
  waterGoal: number
}) {
  const log = useLiveQuery(() => getHealthLog(day), [day]) ?? emptyHealthLog(day)
  const meal = currentMeal(hour)
  const mealName = copy.meals[meal]
  const eaten = log.meals[meal]
  const earlier = order.slice(0, order.indexOf(meal))

  return (
    <section className="card health" aria-label={`${copy.water}, ${mealName}`}>
      <div className="health__row">
        <div className="health__text">
          <p className="label">{copy.water}</p>
          <p>{copy.waterCount(log.water, waterGoal)}</p>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={copy.removeWater}
          disabled={log.water === 0}
          onClick={() => void changeWater(day, -1)}
        >
          <MinusIcon />
        </button>
        <button
          type="button"
          className="icon-btn health__add"
          aria-label={copy.addWater}
          onClick={() => void changeWater(day, 1)}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="health__row">
        <div className="health__text">
          <p className="label">{mealName}</p>
          <p>{eaten ? copy.eaten : copy.notYet}</p>
          {earlier.length > 0 && (
            <p className="secondary">
              {copy.earlier(
                earlier
                  .map((m) =>
                    log.meals[m] ? copy.mealDone(copy.meals[m]) : copy.mealMissing(copy.meals[m]),
                  )
                  .join(' · '),
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn health__ate"
          aria-pressed={eaten}
          aria-label={copy.ateLabel(mealName)}
          onClick={() => void setMeal(day, meal, !eaten)}
        >
          {eaten && <CheckIcon size={18} />}
          {copy.ate}
        </button>
      </div>
    </section>
  )
}
