import { useRef, type ReactNode } from 'react'
import { ReadAloudButton } from '../components/ReadAloudButton'
import './Screen.css'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  /** Controls shown before the title, e.g. a back button. */
  leading?: ReactNode
  /** Extra controls after the read-aloud button. */
  trailing?: ReactNode
  children: ReactNode
}

/** Standard screen frame: header with read-aloud, then content. */
export function Screen({ title, subtitle, leading, trailing, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section className="screen" ref={ref}>
      <header className="screen__header">
        {leading}
        <div className="screen__titles">
          <h1>{title}</h1>
          {subtitle && <p className="secondary">{subtitle}</p>}
        </div>
        <ReadAloudButton target={ref} />
        {trailing}
      </header>
      <div className="screen__body">{children}</div>
    </section>
  )
}
