# Round 56 — Suites Analyzed

## Suites Re-analyzed

| Suite | Tier | Stars | Language | Test Framework |
|-------|------|-------|----------|----------------|
| grafana/grafana | Gold | ~72,700 | TypeScript/React/Go | Playwright (migrating from Cypress) |
| calcom/cal.com | Gold | ~38,700 | TypeScript/Next.js/Turborepo | Playwright |

## Three-Lens Summary

| Suite | Lens | Key Finding |
|-------|------|-------------|
| grafana-e2e | Anatomy | Tests use shallow nesting (1-level describe), ~20% use numbered `test.step()` for CUJ flows, centralized versioned selector registry via `@grafana/plugin-e2e`, avg ~45 lines/test with ~6 assertions |
| grafana-e2e | Coverage | 163 spec files across 31 projects; suite-level tags (@dashboards, @panels, etc.); detailed contributor style guide; 80:20 happy-path:edge ratio; alerting and user management under-tested in Playwright |
| grafana-e2e | Scaling | 31 Playwright projects, 8 CI shards (20 min timeout), ~25 test directories, max depth 4; active Cypress-to-Playwright migration; `test.use({ featureToggles })` pattern for flag control |
| calcom-e2e | Anatomy | 15 custom fixtures drive setup (users, bookings, prisma, etc.); cleaner AAA due to fixture-driven arrangement; ~10-15% use `test.step()`; avg ~35 lines/test; explicit `test.setTimeout(testInfo.timeout * 3)` for long flows |
| calcom-e2e | Coverage | 83 test files, no tag system; 6+ separate CI workflows by area; 70:30 happy:edge ratio with notable race-condition and concurrent-context tests; cross-browser testing for embeds (Firefox, Safari, Mobile) |
| calcom-e2e | Scaling | 7 Playwright projects, 8 CI shards (20 min timeout), 2 retries; 74% of test files in flat root directory; rich fixture layer (15 fixtures) compensates for simpler directory structure |

## Files Examined

### Grafana (grafana/grafana)
- `playwright.config.ts` -- 31 projects, withAuth helper, baseConfig
- `contribute/style-guides/e2e-playwright.md` -- testing style guide
- `.github/workflows/pr-e2e-tests.yml` -- 8-shard CI workflow
- `e2e-playwright/dashboards-suite/dashboard-browse.spec.ts` -- API-based beforeAll/afterAll, selector registry
- `e2e-playwright/alerting-suite/saved-searches.spec.ts` -- locator factory pattern (ui object), clearSavedSearches helper
- `e2e-playwright/various-suite/explore.spec.ts` -- short smoke test, grafana selectors
- `e2e-playwright/various-suite/perf-test.spec.ts` -- performance metric collection via Prometheus registry
- `e2e-playwright/various-suite/navigation.spec.ts` -- viewport-size-dependent tests, beforeEach setup
- `e2e-playwright/smoke-tests-suite/smoketests.spec.ts` -- acceptance tag, full login-datasource-dashboard flow
- `e2e-playwright/panels-suite/timeseries.spec.ts` -- test.step() with named phases, mouse interaction testing
- `e2e-playwright/dashboard-cujs/dashboard-view.spec.ts` -- numbered CUJ steps, nested test.step()
- `e2e-playwright/dashboards-suite/dashboard-templating.spec.ts` -- variable interpolation verification
- `e2e-playwright/dashboard-new-layouts/dashboards-add-panel.spec.ts` -- feature toggle configuration

### Cal.com (calcom/cal.com)
- `playwright.config.ts` -- 7 projects, dynamic timeouts, custom expect matcher
- `.github/workflows/e2e.yml` -- 8-shard CI with PostgreSQL + MailHog services
- `apps/web/playwright/lib/fixtures.ts` -- 15 custom fixtures, todo() helper
- `apps/web/playwright/booking-pages.e2e.ts` -- comprehensive booking flows, test.step(), concurrent contexts
- `apps/web/playwright/event-types.e2e.ts` -- CRUD operations, recurring events
- `apps/web/playwright/login.e2e.ts` -- test.step() for login/logout, localization
- `apps/web/playwright/webhook.e2e.ts` -- webhook payload verification, toMatchObject
- `apps/web/playwright/workflow.e2e.ts` -- page object fixture pattern (workflowPage), team roles
- `apps/web/playwright/availability.e2e.ts` -- date overrides, timezone handling
- `apps/web/playwright/manage-booking-questions.e2e.ts` -- test.step(), timeout multiplier, complex setup
- `apps/web/playwright/insights.e2e.ts` -- direct Prisma setup for team/membership data

## Methodology Notes

- All test files retrieved via GitHub API (`gh api repos/.../contents/`) and decoded from base64
- File counts derived from directory listing API calls
- Test counts are estimates based on patterns observed in sampled files
- CI workflow data from actual workflow YAML files
- Contributor guides read in full for testing strategy analysis
