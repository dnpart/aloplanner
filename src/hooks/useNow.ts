import { useEffect, useState } from 'react'

/**
 * Current time. By default refreshes at the start of every minute;
 * pass 1000 for a per-second clock (countdowns).
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: number
    const schedule = () => {
      const current = Date.now()
      timer = window.setTimeout(tick, intervalMs - (current % intervalMs) + 20)
    }
    const tick = () => {
      setNow(new Date())
      schedule()
    }
    schedule()
    // Timers pause in the background; catch up as soon as the app is visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return now
}
