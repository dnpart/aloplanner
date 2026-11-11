# Aloplanner

A personal planner app for one user: a Twitch streamer and Live2D rigger/animator. It is designed to be ADHD- and dyslexia-friendly, and helps him keep track of time, plan ahead, and avoid overwhelm. Winter theme, arctic fox and snowy owl guides.

The full spec and build order live in `docs/PLAN.md`. Read it before starting any task, and only build what the current phase calls for. Mockups are in `docs/mockups/`.

## The problems this app solves (in priority order)

1. **Losing track of time / hyperfocus.** He gets stuck on one task and blows past everything else. Time awareness and transitions are the core feature.
2. **Not planning ahead.** He decides things at the last second (e.g. what to stream), then loses time deciding how to start.
3. **Overwhelm** when there's a lot he wants to do.
4. **Sleep before work days**, which leads to skipped meals and forgetting to hydrate.

Starting tasks is NOT a problem for him. Don't build features aimed at motivation to start.

## Tech stack

- Vite + React + TypeScript (strict mode)
- Zustand for app state
- Dexie (IndexedDB) for all persistent data
- date-fns for dates
- React Router using `HashRouter` (required for GitHub Pages)
- vite-plugin-pwa so the web build works offline
- Vitest + Testing Library for tests
- Later phase: Capacitor for the Android APK, with `@capacitor/local-notifications`

Deployment during testing: GitHub Pages via GitHub Actions on push to `main`. Vite `base` must be `/aloplanner/`.

## Hard rules

- **No personal data in the repo.** The repo is public. Never hard-code his name, client names, job details, or anything personal. Use placeholders in code and sample data. The app asks for personal details during first-time setup and stores them on the device only.
- **Fully offline.** No network requests at runtime. No CDNs, no analytics, no remote fonts. Self-host Lexend via `@fontsource/lexend`.
- **Never lose user data.** All reads and writes go through `src/db/`. Every schema change gets a Dexie version bump with a migration. Never delete or rename a stored field without migrating it. Export/import backup must keep working after every change.
- **Notifications go through `src/platform/notify.ts`.** One interface, a web implementation now and a Capacitor implementation later. UI code never calls a notification API directly.
- **Stay in the current phase.** If something from a later phase seems needed, stop and ask instead of building it.

## Design system

Dark (night) mode is the default and the priority. Light (day) mode comes later and must use the same tokens, so define every color as a CSS variable from day one.

Night tokens:

- Background gradient: `#0B1330` → `#17224A` → `#24325E` (top to bottom), with a subtle star field
- Card: `rgba(30,42,80,0.82)`, border `rgba(255,255,255,0.08)`, radius 20px
- Text: `#EEF2FA`; secondary text: `#B4C0D8`
- Accent (buttons, rings, links): `#8EC5FF` with dark text `#0B1330`
- Speech bubble: `#24325E`
- Category colors (always paired with a text label, never color alone):
  - Stream `#B9A6FF`
  - Store `#FFB574`
  - Commission `#F4A3C0`
  - Life `#7FD6C7`
  - Health `#FFE08A`
- "Now" line on timelines: `#FF8A8A`

Day mode (later): sky gradient `#BFE0F7` → `#F4F9FD` with soft clouds, cards white at 86% opacity, text `#1D2A3A`, accent `#2F6FB0`.

## Accessibility (dyslexia-friendly, non-negotiable)

- Font: Lexend everywhere. Body text 15–16px minimum, line height 1.5, slight letter spacing.
- Text size setting (100% / 115% / 130%) that scales the whole UI.
- Left-aligned text only. Never justify. No all-caps for body text (short labels are fine). No strikethrough for completed items: dim them and show a check instead.
- Short sentences. One idea per line where possible.
- Every icon has a visible text label or an `aria-label`.
- Read-aloud button on every main screen, using the Web Speech API (`speechSynthesis`) now and native TTS later.
- Touch targets at least 44×44px.
- Text contrast at least 4.5:1.
- Respect `prefers-reduced-motion`.

## Layout

The target phone is a Samsung Galaxy Z Fold 8, so the app must handle two screens:

- **Cover screen** (narrow, under 600px wide): single column, bottom nav, floating "Brain dump" button.
- **Inner screen** (unfolded, 600px and wider): navigation rail on the left, two-pane layouts on Today and Plan (Today on the left, timeline on the right).

Bottom nav / rail items: Today, Plan, Stream, Work, Play. Settings opens from the Today header.

Switching between folded and unfolded must keep state and scroll position.

## Characters

SVGs live in `src/assets/characters/`. Use them through a `<Guide>` component (`character`, `pose`, `message`, `actions`). Never inline the SVG markup in screens.

- **Owl = teacher.** Time checks, tips, guides, planning help. Poses: `owl` (neutral), `owl-happy`, `owl-sleepy`, `owl-bowtie` (teaching).
- **Fox = cheerleader.** Wins, encouragement, nudges, wind-down. Poses: `fox` (neutral), `fox-happy`, `fox-waving`, `fox-sleepy`, `fox-queen` (big wins).

## Writing and tone

- He has a big sense of humor. Nudges and wins can be funny and a little cheeky.
- Bedtime, overwhelm, and anything stressful get calm, plain, kind wording. No jokes there.
- Never crude, never mean, never bigoted. Never guilt-trip about missed tasks or broken streaks.
- Consistency is shown as "X of the last 7 days", never as a streak that resets to zero.
- All user-facing copy lives in `src/content/` (message bank, guides, labels), not inline in components.

## Workflow

- One feature per commit, with a clear message. Commit only when typecheck, lint, and tests pass.
- Before marking a task done, check it on a narrow (≈390px) and a wide (≈760px) viewport.
- After finishing a task, tick it off in `docs/PLAN.md`.
- If a request is ambiguous, ask one short question rather than guessing.
