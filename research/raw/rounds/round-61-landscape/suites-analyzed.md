# Round 61 — Suites and Resources Analyzed

## Suites with Coverage Strategy Relevance

| # | Project / Resource | URL | Type | Coverage Strategy Evidence | Relevance |
|---|-------------------|-----|------|---------------------------|-----------|
| 1 | **grafana/grafana** | https://github.com/grafana/grafana | Production suite (97k+ stars) | Structural tiering: `smoke-tests-suite/`, `dashboard-cujs/` (Critical User Journeys), `unauthenticated/`, per-datasource projects, role-based projects (`admin`, `viewer`). `@acceptance` tag on smoke tests. Setup/teardown project dependencies. | **Gold** — Best example of structural tier organization found anywhere |
| 2 | **RocketChat/e2e-playwright** | https://github.com/RocketChat/e2e-playwright | Production suite | Tag system (`smoke`, `sanity`, `critical`, `slow`) with styled Monocart reporter and JIRA integration columns. Custom tag colors and descriptions. | **Silver** — Most mature tag taxonomy found in a real suite |
| 3 | **Opetushallitus/valtionavustus** | https://github.com/Opetushallitus/valtionavustus | Production suite (Finnish gov) | Separate Playwright projects for `smoke-test-qa` and `smoke-test-prod` targeting different environments. Default project for full tests. | **Silver** — Real government service with env-specific smoke projects |
| 4 | **digitalservicebund/ris-search** | https://github.com/digitalservicebund/ris-search | Production suite (German gov) | Separate `smoke-tests` project targeting staging with basic auth. Cross-browser projects for full tests; single Chrome for smoke. | **Silver** — Another government service with smoke tier separation |
| 5 | **playwrightsolutions/feature-map** | https://github.com/playwrightsolutions/feature-map | npm package / tool | YAML-based feature coverage tracking. Maps pages → features → boolean. Calculates per-page and total coverage percentages. | **Silver** — Only dedicated feature coverage tracking tool found |
| 6 | **mxschmitt/playwright-test-coverage** | https://github.com/mxschmitt/playwright-test-coverage | Demo repo | Istanbul-based code coverage collection for Playwright tests. | Bronze — Reference implementation for code coverage |
| 7 | **bgotink/playwright-coverage** | https://github.com/bgotink/playwright-coverage | npm package | V8-to-Istanbul coverage pipeline. No instrumentation needed. | Bronze — Tool for code coverage without build changes |
| 8 | **stevez/nextcov** | https://github.com/stevez/nextcov | npm package | Next.js-specific V8 coverage for Playwright E2E tests. | Bronze — Niche but demonstrates V8 approach |
| 9 | **checkly/mac-demo-repo** | https://github.com/checkly/mac-demo-repo | Demo repo / tool | Monitoring as Code: reuses Playwright E2E tests as production synthetic monitors. Tags select which tests become monitors. | Bronze — Bridges testing and monitoring |
| 10 | **aeshamangukiya/playwright-test-automation-framework** | https://github.com/aeshamangukiya/playwright-test-automation-framework | QA framework | `tag: ['@smoke', '@regression']` with severity annotations. Allure reports with POM. | Bronze — Template showing tag + severity pattern |
| 11 | **OmonUrkinbaev/playwright-qa-automation** | https://github.com/OmonUrkinbaev/playwright-qa-automation | QA framework | Tags: `@smoke`, `@ui`, `@api`. Separates UI and API test categories. | Bronze — Shows cross-layer tag organization |
| 12 | **AtulKrSharma/PlaywrightInjectTagsWithCaching** | https://github.com/AtulKrSharma/PlaywrightInjectTagsWithCaching | Demo repo | Runtime tag injection via GitHub Actions with cache. Dynamic tag application for CI. | Bronze — Novel CI tag injection approach |

## Community Resources with Coverage Strategy Guidance

| # | Resource | URL | Type | Key Takeaway |
|---|----------|-----|------|-------------|
| 13 | **Playwright Official Best Practices** | https://playwright.dev/docs/best-practices | Official docs | Focus on user-visible behavior; mock third parties; test isolation; use web-first assertions |
| 14 | **Playwright Official Annotations/Tags** | https://playwright.dev/docs/test-annotations | Official docs | v1.42 tag syntax; `--grep`/`--grep-invert` filtering; per-project grep |
| 15 | **Tim Deschryver — Tags and Grep** | https://timdeschryver.dev/blog/create-and-run-playwright-test-sets-using-tags-and-grep | Blog post | Four tag categories: `@smoke`, `@flow`, `@ci`, `@feature`. "A test not executed is always faster." |
| 16 | **Playwright (Debbie O'Brien) — Tagging Tests** | https://dev.to/playwright/tagging-your-playwright-tests-3omm | Official blog | New v1.42 tag property; avoids title clutter; filtering in HTML reports, UI Mode, VSCode |
| 17 | **Playwright (Debbie O'Brien) — Organizing Tests** | https://dev.to/playwright/organizing-playwright-tests-effectively-2hi0 | Official blog | Logged-in vs logged-out separation; custom fixtures; test.step(); annotation categories |
| 18 | **BugBug — E2E Test Coverage** | https://bugbug.io/blog/software-testing/e2e-test-coverage/ | Guide | "Money Paths" framework; risk-based prioritization; coverage is about confidence, not completeness |
| 19 | **Alphabin — Improving Playwright Test Coverage** | https://www.alphabin.co/blog/playwright-test-coverage | Guide | Risk model: Impact × Likelihood; 80% target; spreadsheet tracking; positive/negative/edge categories |
| 20 | **Makerkit — Smoke Testing Your SaaS** | https://makerkit.dev/blog/tutorials/smoke-testing-saas-playwright | Tutorial | Smoke = 10–20% of functionality; 3 categories: auth, payment, core CRUD; < 5 min target |
| 21 | **Currents — Measuring Code Coverage** | https://currents.dev/posts/how-to-measure-code-coverage-in-playwright-tests | Guide | V8 API + v8-to-istanbul; Chromium-only; coverage as guide not goal; setup steps |
| 22 | **Playwright Solutions — Feature Map** | https://playwrightsolutions.com/tracking-automated-ui-testing-using-a-feature-map-with-playwright/ | Blog post | YAML feature map for tracking; binary coverage; manual maintenance; quarterly full-site checks |
| 23 | **Playwright Solutions — CI/CD with GitHub Actions** | https://playwrightsolutions.com/the-definitive-guide-to-api-test-automation-with-playwright-part-16-adding-ci-cd-through-github-actions/ | Guide | Two-tier CI: daily cron full suite + PR targeted (changed files only via git diff) |
| 24 | **Denis Skvortsov — Selective Test Execution** | https://dev.to/denis_skvortsov/selective-test-execution-mechanism-with-playwright-using-github-actions-862 | Blog post | Monorepo pattern: git diff → service tags → selective grep. Shared code changes → full suite. |
| 25 | **Integrating Playwright with CI/CD** | https://dev.to/aswani25/integrating-playwright-with-cicd-pipelines-1g1m | Guide | Smoke on every commit; full suite nightly; dynamic worker count for CI |
| 26 | **Testing Pyramid — Frontend** | https://www.techme365.com/posts/046 | Guide | Unit 50–60%, Component ≥80%, E2E critical flows only |
| 27 | **Checkly — Synthetic Monitoring** | https://www.checklyhq.com/docs/detect/synthetic-monitoring/playwright-checks/overview/ | Product docs | Playwright tests → production monitors; tag-based selection; global locations |
| 28 | **Testomat.io — Playwright Integration** | https://docs.testomat.io/tutorials/playwright/ | Product docs | Test management with automated coverage %, flaky detection, out-of-sync tracking |
| 29 | **cryan.com — Negative Testing in Playwright** | https://www.cryan.com/blog/20250410.jsp | Blog post | Try/catch pattern for error validation; reusable expectError helper |
| 30 | **Grafana PR #97980 — Prometheus Smoke Tests** | https://github.com/grafana/grafana/pull/97980 | Pull request | Shows Grafana team actively adding smoke tests for datasource plugins; Drone CI to GHA migration |

## Summary Statistics

- **Production suites with tiered coverage**: 4 (Grafana, RocketChat, Finnish gov, German gov)
- **Coverage measurement tools**: 4 (feature-map, playwright-coverage, playwright-test-coverage, nextcov)
- **Community guides on coverage strategy**: 17
- **Total resources analyzed**: 30

## Quality Assessment

| Tier | Count | Examples |
|------|-------|---------|
| Gold (production suite with mature coverage patterns) | 1 | Grafana |
| Silver (production suite or tool with clear coverage practices) | 4 | RocketChat, Finnish gov, German gov, feature-map |
| Bronze (template/demo/tool with partial relevance) | 7 | Coverage tools, QA frameworks |
| Community guidance (blogs, docs, guides) | 17 | Playwright docs, BugBug, Alphabin, Makerkit, etc. |
