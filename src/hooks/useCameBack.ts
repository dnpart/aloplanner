import { useEffect } from 'react'
import { getMeta, setMeta } from '../db/meta'
import { fromLocalISO, toLocalISO } from '../lib/dates'
import { encourage } from '../messages/encourage'

const AWAY_HOURS = 4

/** Welcomes him back after a few hours away. Never mentions how long. */
export function useCameBack() {
  useEffect(() => {
    let cancelled = false
    const touch = () => void setMeta('lastActiveAt', toLocalISO(new Date()))

    const check = async () => {
      const last = await getMeta('lastActiveAt')
      const now = new Date()
      if (cancelled) return
      if (last && now.getTime() - fromLocalISO(last).getTime() >= AWAY_HOURS * 3_600_000) {
        void encourage('came-back', { now })
      }
      touch()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void check()
      else touch()
    }

    void check()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') touch()
    }, 5 * 60_000)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', touch)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', touch)
    }
  }, [])
}
