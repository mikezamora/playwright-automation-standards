# Round 74 — Suites Analyzed

## Scale Tier Analysis (config complexity across tiers)

### Tier 1 — Small (<50 tests)
1. **Excalidraw** (`excalidraw/excalidraw`) — ~30 specs, minimal config, 2 browser projects
2. **Slate** (`ianstormtaylor/slate`) — ~25 specs, 3-4 browser projects, conditional WebKit

### Tier 2 — Medium (50-200 tests)
3. **Ghost CMS** (`TryGhost/Ghost`) — 81 specs, admin/portal directories, describe-level isolation
4. **Immich** (`immich-app/immich`) — 90+ specs, 3 projects (web/ui/maintenance), Docker-based
5. **freeCodeCamp** (`freeCodeCamp/freeCodeCamp`) — 126 specs, FLAT structure (anti-pattern at this scale), 1 worker

### Tier 3 — Large (200-500 tests)
6. **Grafana** (`grafana/grafana`) — 163+ specs, 30 projects, single mega-config
7. **n8n** (`n8n-io/n8n`) — 174 specs, 5-7 dynamic projects, 5-layer fixtures
8. **Rocket.Chat** (`RocketChat/Rocket.Chat`) — 170 specs, 1 worker serial (anti-pattern), 75 flat spec files
9. **WordPress/Gutenberg** (`wordpress/gutenberg`) — 278 specs, published utils package, 1 worker serial

### Tier 4 — Enterprise (500+ tests)
10. **Next.js** (`vercel/next.js`) — 550+ test dirs, CI-orchestrated (84 shards), timing-based distribution

## Cross-Suite Transition Pattern Evidence

All 10 suites provide evidence for directory restructuring triggers, config evolution stages, and fixture scaling patterns. The transition patterns documented in findings.md are synthesized from observing these suites at their current scale points and inferring the growth path from their git history and organizational choices.

## Community Sources
- Playwright official docs: Sharding, Parallelism, Projects, Best Practices
- DEV Community (Playwright team): "Organizing Playwright Tests Effectively"
- BrowserStack: "15 Best Practices for Playwright testing in 2026"
- FrugalTesting: "Best Practices for Writing Scalable Playwright Test Scripts"
