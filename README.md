# Aloplanner

A calm, offline-first planner with a winter theme and two guides: an owl (teacher) and a fox (cheerleader). Built to be ADHD- and dyslexia-friendly.

- Project rules: [`CLAUDE.md`](CLAUDE.md)
- Spec and build phases: [`docs/PLAN.md`](docs/PLAN.md)
- Mockups: [`docs/mockups/`](docs/mockups/)

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/aloplanner/
npm run check    # typecheck + lint + tests
npm run build    # production build in dist/
```

All data stays on the device (IndexedDB). Use Settings › Backup to move it between devices.

## Deploy

Every push runs the checks. Pushes to `main` also deploy to GitHub Pages.
One-time setup: repo Settings › Pages › Source: **GitHub Actions**.
