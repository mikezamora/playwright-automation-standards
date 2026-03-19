# Round 88 — Suites Analyzed

| Suite | GitHub | Stars | Stack | Test Files | Scale Tier | Previously Analyzed |
|-------|--------|-------|-------|------------|-----------|-------------------|
| PostHog | PostHog/posthog | ~25,000 | TypeScript, React, Django | ~200+ specs | Large | No |
| Directus | directus/directus | ~30,000 | TypeScript, Vue.js, Node.js | ~60 specs | Medium | No |
| AppSmith | appsmithorg/appsmith | ~35,000 | TypeScript, React, Java | ~300+ specs | Large | No |
| Remix | remix-run/remix | ~30,000 | TypeScript, React, Node.js | ~150 specs | Medium-Large | No |

## Suite Characteristics

**PostHog** — Product analytics platform. Unique "fewer, longer tests with `test.step()`" philosophy. Rich auto-fixture authentication. Django backend with TypeScript frontend. One of the few suites that explicitly documents their testing philosophy.

**Directus** — Headless CMS. Clean Medium-tier suite with `tests/blackbox/` directory structure. Vue.js frontend. Uses function helpers rather than POM classes.

**AppSmith** — Low-code platform. Migrated from Cypress to Playwright. Retains some Cypress patterns (globalSetup, serial execution, `extends BasePage`). Largest test suite in this batch (~300 specs).

**Remix** — React framework. Framework testing project with per-test server instances. High standards compliance (95%). Uses Playwright projects extensively for different framework features (development, production, integration).
