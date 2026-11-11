import { useEffect } from 'react'
import { labels } from '../content/labels'
import { useGuideStore } from '../state/guideStore'
import { Guide, type GuideProps } from './Guide'
import './GuideToast.css'

const AUTO_HIDE_MS = 12_000

/** Shows the current guide notice above the navigation, on every screen. */
export function GuideToast() {
  const notice = useGuideStore((s) => s.notice)
  const dismiss = useGuideStore((s) => s.dismiss)

  useEffect(() => {
    if (!notice || notice.sticky) return
    const timer = window.setTimeout(() => dismiss(notice.key), AUTO_HIDE_MS)
    return () => window.clearTimeout(timer)
  }, [notice, dismiss])

  if (!notice) return null

  const actions = [
    ...(notice.actions ?? []).map((a) => ({
      ...a,
      onClick: () => {
        dismiss(notice.key)
        a.onClick()
      },
    })),
    { label: labels.gotIt, onClick: () => dismiss(notice.key) },
  ]

  return (
    <div className="guide-toast" role="status" aria-live="polite">
      <Guide
        {...({ character: notice.character, pose: notice.pose } as GuideProps)}
        size="small"
        message={<p>{notice.text}</p>}
        actions={actions}
      />
    </div>
  )
}
