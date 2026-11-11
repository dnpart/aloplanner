import { CategoryChip } from '../../components/CategoryChip'
import { CheckIcon, PlusIcon } from '../../components/icons'
import { todayCopy as copy } from '../../content/today'
import type { Block, Category } from '../../db/types'
import { formatTimeRange } from '../../lib/format'
import { useBlockSheet } from '../../state/blockSheetStore'

type Props = { blocks: Block[]; categories: Map<string, Category>; currentId?: string }

/** Today's blocks as a simple list (cover screen). */
export function BlockList({ blocks, categories, currentId }: Props) {
  const { openNew, openEdit } = useBlockSheet()
  return (
    <section className="card today-plan" aria-labelledby="plan-heading">
      <div className="today-plan__head">
        <h2 id="plan-heading">{copy.planHeading}</h2>
        <button type="button" className="btn btn-quiet" onClick={() => openNew()}>
          <PlusIcon />
          {copy.add}
        </button>
      </div>
      {blocks.length === 0 ? (
        <p className="secondary">{copy.nothingNext}</p>
      ) : (
        <ul className="today-plan__list">
          {blocks.map((b) => {
            const done = b.status === 'done'
            return (
              <li key={b.id}>
                <button
                  type="button"
                  className={`today-plan__row${done ? ' is-done' : ''}${b.id === currentId ? ' is-current' : ''}`}
                  onClick={() => openEdit(b.id)}
                >
                  <span className="today-plan__time">{formatTimeRange(b.start, b.end)}</span>
                  <span className="today-plan__title">
                    {done && <CheckIcon size={16} />}
                    {b.title}
                    {done && <span className="visually-hidden">, {copy.doneLabel}</span>}
                  </span>
                  <CategoryChip category={categories.get(b.categoryId)} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
