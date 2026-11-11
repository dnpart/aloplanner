import { useEffect, useState } from 'react'

/** Current time, refreshed at the start of every minute. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: number
    const tick = () => {
      const current = new Date()
      setNow(current)
      timer = window.setTimeout(tick, 60_000 - (current.getTime() % 60_000) + 50)
    }
    timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    return () => window.clearTimeout(timer)
  }, [])
  return now
}
