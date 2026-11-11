import { todayCopy } from '../content/today'

type Props = { minutesLeft: number; totalMinutes: number; size?: number }

/** Shrinking ring with the minutes left in the middle. */
export function TimeRing({ minutesLeft, totalMinutes, size = 96 }: Props) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const left = Math.max(0, Math.ceil(minutesLeft))
  const fraction = totalMinutes > 0 ? Math.min(1, left / totalMinutes) : 0
  return (
    <svg
      role="img"
      aria-label={todayCopy.ringLabel(left, Math.round(totalMinutes))}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className="time-ring"
    >
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--surface-raised)" strokeWidth="10" />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${fraction * circumference} ${circumference}`}
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="50" textAnchor="middle" fontSize="24" fontWeight="600" fill="var(--text)">
        {left}
      </text>
      <text x="48" y="66" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
        {todayCopy.minLeft}
      </text>
    </svg>
  )
}
