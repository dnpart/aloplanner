import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'
import './Sheet.css'

type Props = {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

/**
 * A modal panel: slides up from the bottom on the cover screen, centered
 * when unfolded. Built on <dialog> so focus stays inside and Back/Escape closes it.
 */
export function Sheet({ open, title, closeLabel, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal?.()
    if (!open && dialog.open) dialog.close?.()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      {open && (
        <div className="sheet__inner">
          <header className="sheet__header">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" aria-label={closeLabel} onClick={onClose}>
              <CloseIcon />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  )
}
