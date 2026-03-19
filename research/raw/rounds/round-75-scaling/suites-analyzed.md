# Round 75 — Suites Analyzed

## Execution Strategy Evidence Sources

### Stage 1 — Default Parallel
1. **Excalidraw** (`excalidraw/excalidraw`) — ~30 specs, default parallelism, single CI job
2. **Slate** (`ianstormtaylor/slate`) — ~25 specs, default parallelism, conditional WebKit

### Stage 2 — Tuned Parallelism
3. **Ghost CMS** (`TryGhost/Ghost`) — 81 specs, 1 worker (conservative), describe-level isolation
4. **Immich** (`immich-app/immich`) — 90+ specs, default workers, 4 retries CI

### Stage 3 — Sharding
5. **Supabase** (`supabase/supabase`) — 177 tests, 2 shards
6. **Element Web** (`element-hq/element-web`) — 209 specs, CI matrix sharding

### Stage 4 — Tiered Execution
7. **Grafana** (`grafana/grafana`) — `smoke` project as structural tier, 30 projects
8. **Element Web** — Two-tier CI (fast PR, comprehensive merge)

### Stage 5 — Orchestrated Execution
9. **Next.js** (`vercel/next.js`) — 84 shards, timing-based assignment, multi-dimension matrix

### Anti-Pattern Evidence
10. **Rocket.Chat** (`RocketChat/Rocket.Chat`) — 170 specs, 1 worker, serial execution
11. **WordPress/Gutenberg** (`wordpress/gutenberg`) — 278 specs, 1 worker, serial execution
12. **freeCodeCamp** (`freeCodeCamp/freeCodeCamp`) — 126 specs, 1 worker, flat directory (partial anti-pattern)

## Transition Hurdle Evidence

Cross-suite analysis synthesized from all 15 suites analyzed in rounds 56-75. Transition patterns inferred from:
- Current organizational state vs test count
- Git history indicators (directory restructuring commits)
- Anti-pattern identification (what should have changed but didn't)

## Community Sources (Execution Strategy)
- Playwright official docs: Sharding, Parallelism
- Playwright official docs: `--only-changed` (v1.46+)
- DEV Community (Denis Skvortsov): "Selective test execution mechanism with Playwright"
- DEV Community (Playwright team): "--only-changed option"
- Community dynamic sharding patterns (GitHub Actions matrix)
- PlaywrightSolutions.com: "Run only changed tests in GitHub Actions"
- Microsoft Learn: "Optimal test suite configuration"
