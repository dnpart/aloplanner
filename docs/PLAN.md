# Aloplanner build plan

Read `CLAUDE.md` first. Build phases in order. Each phase ends with a working, deployed build he can test on his phone.

Mockups (exported from the design canvas) are in `docs/mockups/`:

- `today-cover.png`, `today-inner.png`, `time-check.png`
- `plan-calendar.png`, `stream-hq.png`, `work-commissions.png`, `wind-down.png`

Treat them as the visual target. Copy in the mockups is sample text.

The canvas source for each screen is in `docs/mockups/source/` (exact sizes, spacing, and colors). It loads Google Fonts and canvas-only scripts, so read it for values; never copy those into the app.

---

## Data model

All stored in IndexedDB via Dexie. IDs are UUIDs. Dates are ISO strings in local time.

- **Settings** (single record): `displayName`, `theme` (`night` | `day` | `auto`), `textScale`, `checkInMinutes` (default 20), `extensionsPerBlock` (default 1), `sleepHours` (default 8), `getReadyMinutes`, `commuteMinutes`, `waterGoal` (default 8), `messageFrequency` (`low` | `normal` | `high`), `onboarded`.
- **Category**: `id`, `name`, `color`, `builtIn`. Built-ins: Stream, Store, Commission, Life, Health. He can add his own.
- **Block** (anything on the calendar): `id`, `title`, `categoryId`, `start`, `end`, `allDay`, `notes`, `kind` (`block` | `appointment` | `task`), `recurrence` (simple weekly rule or null), `reminders` (minutes before), `checkIns` (bool), `leftOffNote`, `status` (`planned` | `active` | `done` | `skipped`), `taskId?`.
- **Task**: `id`, `title`, `categoryId`, `dueDate?`, `topThreeDate?` (the day it's in his Top 3), `someday` (bool), `steps` (list of `{ id, text, done }`), `done`, `doneAt`.
- **BrainDumpItem**: `id`, `text`, `createdAt`, `processed`.
- **Shift**: `id`, `start`, `end`, `notes`. Shifts also render as Store blocks on the calendar.
- **StreamWeek**: `weekStart`, `days` (list of `{ date, start, end }`).
- **StreamPlan** (one per stream): `id`, `date`, `ideaId?`, `title`, `checklist` (item states), `notes`.
- **StreamIdea**: `id`, `title`, `notes`, `tags`, `lastUsed`.
- **ChecklistTemplate**: `id`, `name` (e.g. "Pre-stream"), `items` (editable list).
- **SetupItem** (stream setup roadmap): `id`, `name`, `status` (`current` | `next` | `someday` | `done`), `notes`, `cost?`.
- **ContentPipeline** (per stream): `streamPlanId`, `clipsMarked`, `tiktokTarget`, `tiktokPosted`, `shortsTarget`, `shortsPosted`, `vodStatus` (`not-started` | `editing` | `uploaded`).
- **Commission**: `id`, `client`, `description`, `stages` (list of names, default below), `currentStage`, `status` (`waiting` | `active` | `review` | `delivered`), `dueDate`, `price?`, `amountPaid?`, `paymentStatus` (`deposit-pending` | `partial` | `paid`), `revisionsAllowed`, `revisionsUsed`, `contactNote` (free text), `notes`.
  - Default stages: Art prep → Rigging → Physics → Expressions → Review → Delivered. Editable per commission (e.g. animation-only jobs).
- **HealthLog** (per day): `date`, `water`, `meals` (`breakfast`, `lunch`, `dinner` booleans).
- **MessageLog**: `messageId`, `shownAt` (to avoid repeats).

Backup: export all tables to one JSON file with a schema version. Import validates, previews counts, then replaces or merges.

---

## Core behaviors

### Time awareness engine (the most important feature)

- When a block is active, the Today screen shows a shrinking ring with minutes left.
- **Check-ins** every `checkInMinutes` (default 20) during long blocks: a small owl notification ("50 min on rigging. Still the plan?").
- **Wrap-up warnings** at 10 minutes and 2 minutes before a block ends.
- At 10 minutes, the full **Time Check screen** appears (see mockup): countdown, what's next, a wrap-up checklist (with a category-specific item like "Save the Live2D file"), and a "where I left off" note field. The note is saved to the block and shown the next time he opens that task.
- **Extensions**: "+10 min" is allowed `extensionsPerBlock` times (default 1). Extending pushes the next block, and the app says so ("Post TikTok clip moves to 8:10").
- He can turn check-ins off for a single block.
- If a block ends and he doesn't respond, the next block starts anyway and the fox nudges him once more, then stops. No nagging loops.

### Plan-ahead nudges

- A stream with no plan gets a nudge the day before ("Wednesday's stream has no game picked"), again that morning, and a firmer one 2 hours before.
- Tapping the nudge opens the idea bank picker, which suggests ideas not used recently.
- Sunday evening (or his chosen day): weekly setup prompt. Set stream days around shifts, pick stream plans, review commissions due.

### Overwhelm controls

- **Top 3**: each day he picks up to three tasks. Everything else goes to Someday, out of sight.
- **"Too much" button** on Today: hides everything except the current block and one next step.
- **Break it down**: any task can be split into small steps. The next unchecked step shows on Today.
- **Brain dump**: one tap from anywhere, type one line, done. Items wait in an inbox to be sorted later (into a task, a block, an idea, or deleted).

### Work-night wind-down

- If there's a shift tomorrow, compute: wake time = shift start − commute − get-ready time; bedtime = wake time − sleep hours. Wind-down starts 60 minutes before bedtime.
- Wind-down screen (see mockup): countdown to bedtime, tomorrow's shift summary, a get-ready checklist (editable template), "I'm heading to bed" and one "remind me in 15" snooze.
- Offers to set the morning alarm.
- Shift mornings: breakfast reminder, water reminder, and a "leave by" reminder.

### Health

- Water counter and meal check-offs on Today.
- Gentle water nudges every ~2 hours during waking hours. Pauses during streams unless he opts in.

### Encouragement system

- Message bank in `src/content/messages.json`. Each message has `id`, `text`, `character`, `pose`, `tone` (`funny` | `calm`), and `contexts` (e.g. `task-done`, `top3-done`, `stream-planned`, `shift-morning`, `wind-down`, `overwhelm`, `came-back`).
- Triggers on real events, not timers. Respect `messageFrequency`. Never repeat a message within 7 days.
- Big wins (all Top 3 done, commission delivered, stream + clips posted) get the queen fox.
- Calm tone only for `wind-down`, `overwhelm`, and missed-task contexts.
- Write at least 15 messages per context at launch.

---

## Phases

### Phase 0: Foundation

- [x] Vite + React + TS scaffold, ESLint, Prettier, Vitest
- [x] GitHub Actions workflow deploying to GitHub Pages on push to `main`
- [x] vite-plugin-pwa so the site works offline after first load
- [x] Design tokens as CSS variables (night first), Lexend self-hosted, star-field background
- [x] App shell: bottom nav under 600px, rail at 600px and wider, routes for all five sections (placeholder screens)
- [x] `<Guide>` component with all character poses, plus speech bubble
- [x] Dexie database with Settings and Category tables, migrations set up
- [x] Export/import backup screen in Settings
- [x] First-time setup: name, sleep hours, get-ready and commute time, text size
- [x] Read-aloud helper and button component

Done when: he can open the Pages link on his Fold, complete setup, and switch between folded and unfolded without layout breaking.

### Phase 1: Today and time awareness

- [ ] Block and Task tables
- [ ] Today screen (cover and inner layouts per mockups): current block with ring, Top 3, water and meals, next block, brain dump button
- [ ] Simple day timeline on the inner screen with a "now" line
- [ ] Add/edit block sheet
- [ ] Time awareness engine: check-ins, wrap-up warnings, Time Check screen, extensions, "where I left off" notes
- [ ] Top 3 picker, Someday list, "Too much" mode, Break it down
- [ ] Brain dump inbox
- [ ] Encouragement system with the first message bank
- [ ] Web notifications through `notify.ts` (best effort; the app must also work fully in-app if notifications are denied)

Done when: he can plan a day of blocks, and the app interrupts him reliably while the app is open.

### Phase 2: Android spike (early on purpose)

Reminders only become reliable in the native app, so prove them on his phone now instead of at the end.

- [ ] Add Capacitor, Android project, and the Capacitor implementation of `notify.ts` (local notifications, exact alarms)
- [ ] GitHub Actions workflow that builds a signed release APK and uploads it as an artifact
- [ ] Signing keystore stored as GitHub secrets. Document backup steps in `docs/RELEASE.md`
- [ ] In-app guide for Samsung battery settings (set Aloplanner to "Unrestricted", remove from "Sleeping apps")
- [ ] Test on the Fold: check-ins and wrap-up warnings fire with the app closed, screen off, and after a reboot

Done when: notifications fire reliably on his Fold with the app closed. If they don't, fix this before moving on.

Note: browser data does not carry over to the APK. Use export/import to move test data.

### Phase 3: Plan (calendar)

- [ ] Day, week, and month views
- [ ] Category filter chips (multi-select) and a "hidden by filters" count
- [ ] Custom categories with color picker (pick from preset accessible colors)
- [ ] Weekly recurring blocks
- [ ] Shifts: quick entry for the week, shown as Store blocks
- [ ] Drag to move and resize blocks on the inner screen

### Phase 4: Wind-down and routines

- [ ] Bedtime calculation from tomorrow's shift
- [ ] Wind-down screen and editable get-ready checklist
- [ ] Morning alarm offer (native alarm via Capacitor, or a high-priority notification)
- [ ] Shift-morning reminders (breakfast, water, leave by)
- [ ] Water nudges

### Phase 5: Stream HQ

- [ ] Week-by-week stream day picker that shows shift days and warns about clashes
- [ ] Next stream card with plan status and idea bank picker
- [ ] Idea bank (add, tag, mark used)
- [ ] Editable pre-stream checklist template
- [ ] Content pipeline per stream: clips marked, TikTok and YouTube Shorts posted vs. target, VOD highlight status
- [ ] Setup roadmap (current gear, next upgrade, someday) that he can edit as his setup changes
- [ ] Plan-ahead nudges
- [ ] Post-stream prompt: "How many clips did you mark?" to start the pipeline

### Phase 6: Work (commissions and store)

- [ ] Work screen with Store shifts / Commissions toggle
- [ ] Commission list: summary counts, stage tracker, due date, payment status, revision count
- [ ] Commission detail: edit stages, notes, contact note, payments, revisions
- [ ] Commission deadlines appear on the calendar
- [ ] Store tab: upcoming shifts and hours worked this week

### Phase 7: Learn (guides)

Short card-based guides, each readable in under 2 minutes, with read-aloud. The owl offers them in context (e.g. first time he plans a week, offer the time blocking guide).

- [ ] Time blocking
- [ ] Timeboxing and buffers (why blocks need breathing room)
- [ ] Transitions: how to stop a task cleanly
- [ ] Weekly planning in 10 minutes
- [ ] Batching content (clips and posts)
- [ ] Stream prep routine

### Phase 8: Play (brain games)

Procedurally generated, endless, short sessions. Soft session cap (default 15 minutes, then the owl suggests a break). Games teach the app's own skills.

- [ ] **Block Party**: fit task blocks into a day with constraints. Teaches time blocking.
- [ ] **Time Guess**: estimate how long something takes, then see the answer. Trains time estimation.
- [ ] **Snowball Sort**: sort items into urgent/important buckets against a timer.
- [ ] **Snowflake Memory**: pattern and sequence recall.

### Phase 9: Polish and launch

- [ ] Day mode with clouds and sky gradient, plus "auto" theme
- [ ] Animations (character entrances, ring) respecting reduced motion
- [ ] App icon (adaptive icon from the fox)
- [ ] Convert the GitHub Pages site into a landing page with the APK download
- [ ] Update `docs/RELEASE.md` with the release process

---

## Art still needed

Existing poses cover most of the app. These would fill gaps (ranked by priority):

1. **Owl pointing at a watch or clock** for time checks (currently uses the neutral owl)
2. **Fox thinking** for the stream idea picker and planning prompts
3. **Calm, reassuring pose** (either character) for overwhelm mode
4. **Owl waving** to pair with the fox during first-time setup
5. Optional: fox with a gaming headset (Stream HQ), owl with a clipboard (commissions), both celebrating together (big wins)

Also needed for Phase 9: an app icon. A simplified fox head on the night-blue background, supplied as two layers (foreground and background) for Android adaptive icons.

## Device testing checklist (run each phase)

- [ ] Cover screen, portrait
- [ ] Inner screen, both orientations
- [ ] Fold and unfold mid-task: no lost state
- [ ] Largest text size: nothing clipped or overlapping
- [ ] Read-aloud works on every main screen
- [ ] Airplane mode: everything works
