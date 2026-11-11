import type { ReactNode } from 'react'
import './Screen.css'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  /** Controls shown before the title, e.g. a back button. */
  leading?: ReactNode
  /** Controls after the title, e.g. a settings button. */
  trailing?: ReactNode
  children: ReactNode
}

/** Standard screen frame: header, then content. */
export function Screen({ title, subtitle, leading, trailing, children }: Props) {
  return (
    <section className="screen">
      <header className="screen__header">
        {leading}
        <div className="screen__titles">
          <h1>{title}</h1>
          {subtitle && <p className="secondary">{subtitle}</p>}
        </div>
        {trailing}
      </header>
      <div className="screen__body">{children}</div>
    </section>
  )
}
