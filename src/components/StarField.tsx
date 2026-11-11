import { useMemo } from 'react'
import './StarField.css'

type Star = { x: number; y: number; r: number; o: number }

/** Small deterministic PRNG so the sky looks the same on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeStars(count: number, seed = 7): Star[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    // Denser near the top, like the mockups.
    y: Math.pow(rand(), 1.6) * 100,
    r: 0.6 + rand() * 0.9,
    o: 0.25 + rand() * 0.6,
  }))
}

/** Fixed night sky behind every screen. Purely decorative. */
export function StarField() {
  const stars = useMemo(() => makeStars(70), [])
  return (
    <div className="sky" aria-hidden="true">
      <svg className="sky__stars" width="100%" height="100%">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="var(--star)" opacity={s.o} />
        ))}
      </svg>
    </div>
  )
}
