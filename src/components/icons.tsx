/** Stroke icons. Always paired with a visible label or an aria-label on the control. */

type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
})

export function SettingsIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  )
}

export function BackIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

export function PlusIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function MinusIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.4}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function TodayIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 4l4 5h8l4-5v8c0 5-4 9-8 9s-8-4-8-9z" />
      <path d="M9.5 13h.01M14.5 13h.01" />
    </svg>
  )
}

export function PlanIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function StreamIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="2" />
      <path d="M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
    </svg>
  )
}

export function WorkIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  )
}

export function PlayIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="2" y="7" width="20" height="11" rx="5" />
      <path d="M7 11v3M5.5 12.5h3" />
      <circle cx="16" cy="11.5" r="1" />
      <circle cx="18" cy="13.5" r="1" />
    </svg>
  )
}

export function CheckIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={2.6}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
