/** Copy for the main screens. Placeholder screens get filled in by later phases. */

export function greeting(hour: number, name: string): string {
  const part = hour < 5 ? 'Late night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  return name ? `${part}, ${name}` : part
}

export const screens = {
  today: {
    placeholder: ['You’re all set up.', 'Your blocks, Top 3, water, and meals land here next.'],
  },
  plan: {
    title: 'Plan',
    placeholder: ['Your calendar will live here.', 'Day, week, and month views are on the way.'],
  },
  stream: {
    title: 'Stream HQ',
    placeholder: [
      'Stream HQ is still warming up.',
      'Stream days, idea bank, and checklists are coming.',
    ],
  },
  work: {
    title: 'Work',
    placeholder: ['Commissions and store shifts will live here.'],
  },
  play: {
    title: 'Play',
    placeholder: ['Brain games are coming.', 'Short ones. The owl insisted.'],
  },
  settings: {
    title: 'Settings',
  },
} as const
