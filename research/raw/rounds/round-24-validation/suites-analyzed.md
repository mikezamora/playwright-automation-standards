# Round 24 — Suites Analyzed

**Phase:** Validation
**Focus:** Deep dive on assertion strategies — locator vs page assertions, ESLint enforcement, assertion composition
**Date:** 2026-03-18

## Suites and Sources Analyzed

### Gold-Standard Suites — Assertion Enforcement Evidence

1. **grafana/grafana** — ESLint config with `eslint-plugin-playwright` recommended rules; `prefer-web-first-assertions` enforced; `no-force-option` enforced
2. **calcom/cal.com** — Assertion patterns in flaky-fix PRs; `toBeVisible()` + `toHaveURL()` + `toHaveCount()` as the dominant assertion trio; visibility-before-interaction pattern
3. **freeCodeCamp/freeCodeCamp** — Serial test execution with focused assertions; contributor guide prescribes assertion patterns alongside locator hierarchy
4. **microsoft/playwright** — Self-tests as canonical assertion examples; every matcher demonstrated in test files
5. **supabase/supabase** — `toBeOK()` for API validation; `toHaveURL()` for auth flow assertions

### ESLint Plugin Deep Dive

6. **eslint-plugin-playwright** (playwright-community) — 60 ESLint rules; 11+ in recommended config related to assertions/waits; complete rule taxonomy analyzed

### Documentation and Community Sources

7. **Playwright official docs** — Best practices page: web-first vs manual assertion anti-pattern; locator priority hierarchy
8. **Checkly docs** — Assertion granularity guidance: "always go with the more granular option"; soft vs hard assertion decision framework
9. **BrowserStack guide** — Assertion timeout configuration; locator assertion vs page assertion decision tree
10. **Tim Deschryver blog** — Retry API comparison: toPass vs expect.poll vs built-in locator retry vs test retries
11. **TestDino** — Assertion checklist for reducing flaky tests; custom error message patterns

## Method

- Analyzed `eslint-plugin-playwright` rule list for all assertion-related and wait-related rules
- Cross-referenced ESLint enforcement in Gold suite configurations
- Studied assertion composition patterns in Cal.com flaky-fix PRs
- Compared locator assertion vs page assertion usage frequency across Gold suites
- Documented assertion timeout hierarchy and configuration patterns
