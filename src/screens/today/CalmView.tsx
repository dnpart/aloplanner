import { useLiveQuery } from 'dexie-react-hooks'
import { Guide, type GuideProps } from '../../components/Guide'
import { overwhelmCopy as copy } from '../../content/overwhelm'
import { getTask, listTopThree } from '../../db/tasks'
import type { Block } from '../../db/types'
import { useCalm } from '../../state/calmStore'
import { oneNextStep } from './oneNextStep'

/** "Too much" mode: a calm word, the current block (rendered by Today), and one next step. */
export function CalmMessage() {
  const message = useCalm((s) => s.message)
  return (
    <Guide
      {...((message
        ? { character: message.character, pose: message.pose }
        : { character: 'owl' }) as GuideProps)}
      message={<p>{message?.text ?? copy.fallbackMessage}</p>}
    />
  )
}

export function OneNextStepCard({
  day,
  current,
  next,
}: {
  day: string
  current?: Block
  next?: Block
}) {
  const exit = useCalm((s) => s.exit)
  const step = useLiveQuery(async () => {
    const task = current?.taskId ? await getTask(current.taskId) : undefined
    return oneNextStep(task, await listTopThree(day), next) ?? null
  }, [day, current?.id, current?.taskId, next?.id])

  return (
    <>
      <section className="card stack" aria-labelledby="one-step-heading">
        <h2 id="one-step-heading" className="label">
          {copy.oneNextStep}
        </h2>
        {step !== undefined && <p className="calm__step">{step ?? copy.nothing}</p>}
      </section>
      <button type="button" className="btn btn-secondary" onClick={exit}>
        {copy.showEverything}
      </button>
    </>
  )
}
