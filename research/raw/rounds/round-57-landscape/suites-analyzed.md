# Round 57 — Suites Analyzed

Re-analysis of three Gold-tier suites through test anatomy, coverage strategy, and scaling organization lenses. All data from direct inspection of current main/canary branches via GitHub API.

| Suite | Lens | Key Finding |
|-------|------|-------------|
| affine-e2e | Anatomy | Flat test structure with zero `describe` blocks and no `test.step()`; all setup delegated to 19 shared utility modules in `@affine-test/kit` |
| affine-e2e | Coverage | ~120+ spec files across 7 test projects covering local/cloud/desktop/mobile/copilot, but ~95% happy-path with no error-path or accessibility tests |
| affine-e2e | Scaling | 7 independent Playwright projects with 12 CI shards, shared `@affine-test/kit` monorepo package, 1357-line CI workflow |
| immich-e2e | Anatomy | Dual-framework approach: vitest+supertest for API tests (nested describes, heavy beforeAll), Playwright for web UI (lighter setup), plus mock-network UI tests with SeededRandom |
| immich-e2e | Coverage | Best error-path ratio (~30% in API tests) with reusable `errorDto` and `signupResponseDto` assertion factories; server API (23 specs) dominates over web UI (7 specs) |
| immich-e2e | Scaling | 3 Playwright projects + vitest in single config, no CI sharding but dual-architecture (x86 + ARM) matrix, Docker Compose for full-stack test environment |
| freecodecamp-e2e | Anatomy | i18n-driven assertions using imported translation JSON files; `execSync` database seeding in beforeAll; role-first locator strategy per documented contributor guidelines |
| freecodecamp-e2e | Coverage | 117 spec files in flat directory covering landing/editor/challenges/settings/certifications/exams, but only chromium in CI despite 6 defined browser projects |
| freecodecamp-e2e | Scaling | Flat single-directory structure with `workers: 1` serial execution, no sharding, `maxFailures: 6` fast-fail; mid-migration from Cypress with documented test-writing guidelines |

## Cross-Suite Summary

| Observation | Evidence |
|-------------|----------|
| `test.step()` unused across all three suites | Zero occurrences in ~280+ spec files examined; suites prefer short focused tests over long multi-step tests |
| No test tags anywhere | No `@smoke`, `@critical`, `@regression` annotations; categorization done via directory structure and CI workflow filtering |
| Error-path coverage weak in UI tests | Only Immich API tests (vitest) achieve meaningful error coverage (~30%); all Playwright UI tests are ~90-95% happy-path |
| Utility abstraction depth correlates with project count | AFFiNE (7 projects, 19 utilities) > Immich (3 projects, ~8 utilities) > freeCodeCamp (1 active project, 7 utilities) |
| Directory structure mirrors deployment architecture | AFFiNE splits by platform target, Immich splits by system layer, freeCodeCamp uses monolithic flat directory |

## Sources Consulted

- `toeverything/AFFiNE` canary branch: `tests/` directory tree, 7 test project configs, `build-test.yml` CI (1357 lines), 10+ spec files read in full, `@affine-test/kit` source
- `immich-app/immich` main branch: `e2e/` directory tree, `playwright.config.ts`, `test.yml` CI, `fixtures.ts`, `generators.ts`, `responses.ts`, `utils.ts`, 8+ spec files read in full, [Immich testing docs](https://docs.immich.app/developer/testing/)
- `freeCodeCamp/freeCodeCamp` main branch: `e2e/` directory (126 entries), `playwright.config.ts`, `global-setup.ts`, `e2e-playwright.yml` CI, 8+ spec files read in full, [contributor testing guide](https://contribute.freecodecamp.org/how-to-add-playwright-tests/), [test ID discussion #51770](https://github.com/freeCodeCamp/freeCodeCamp/issues/51770)
- [DeepWiki AFFiNE testing infrastructure](https://deepwiki.com/toeverything/AFFiNE/7.3-deployment-architecture)
