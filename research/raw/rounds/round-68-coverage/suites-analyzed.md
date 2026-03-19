# Round 68 — Suites and Sources Analyzed

## Suites Re-examined (E2E boundary mapping)

| Suite | Tier | E2E Spec Files | E2E Boundary Focus |
|-------|------|----------------|-------------------|
| grafana/grafana | Gold | 163 | Dashboard/panel CRUD, data sources, CUJs, smoke |
| calcom/cal.com | Gold | 73 | Booking flows, auth, settings, embeds |
| immich-app/immich | Gold | 45+ (API+UI) | Two-layer: API breadth + UI depth |
| TryGhost/Ghost | Gold | 199 (5 layers) | Multi-layer E2E pyramid within E2E |
| element-hq/element-web | Gold | 209 | Crypto-heavy, multi-homeserver, multi-browser |
| n8n-io/n8n | Silver | 174 | Workflow operations, chaos testing, AI features |
| toeverything/AFFiNE | Gold | 120+ | Multi-platform (local/cloud/desktop/mobile) |

## Community Sources Consulted

| Source | Key Contribution |
|--------|-----------------|
| Kent C. Dodds — "How to Know What to Test" (kentcdodds.com) | Testing trophy; test use cases not code; single happy-path E2E per feature |
| Kent C. Dodds — "The Testing Trophy" (kentcdodds.com) | ROI-based testing layers; integration > E2E in volume |
| Kent C. Dodds — "Static vs Unit vs Integration vs E2E" (kentcdodds.com) | Layer definitions; confidence vs cost tradeoffs |
| web.dev — "Pyramid or Crab? Find a testing strategy that fits" | 6 strategy shapes; E2E placement in each; selection criteria by team/app |
| Leading EDJE — "Optimizing Your Test Strategy with Playwright" | Anti-patterns; hourglass shape; what NOT to E2E test |
| Makerkit — "Smoke Testing Your SaaS" | Smoke = 10-20% of functionality; 3 essential categories |
| Currents.dev — "How to Measure Code Coverage in Playwright Tests" | Coverage methods; limitations; risk-based prioritization |
| DeviQA — "Guide to Playwright E2E Testing in 2026" | E2E scope: auth, forms, user flows |
| BrowserStack — "15 Best Practices for Playwright 2026" | Smoke on PRs, regression on merge, slow on nightly |
