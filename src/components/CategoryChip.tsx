import type { Category } from '../db/types'
import './CategoryChip.css'

/** Category color always comes with its name. */
export function CategoryChip({ category, extra }: { category?: Category; extra?: string }) {
  if (!category) return null
  return (
    <span className="chip" style={{ background: category.color }}>
      {category.name}
      {extra ? ` · ${extra}` : ''}
    </span>
  )
}
