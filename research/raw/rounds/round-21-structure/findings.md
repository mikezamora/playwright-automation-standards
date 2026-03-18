# Round 21 — Findings

**Phase:** Structure
**Focus:** Validation sweep on structure patterns — confirming universality vs. suite-specificity

---

## Finding 1: `.spec.ts` file naming is near-universal across all quality tiers

The `.spec.ts` naming convention is dominant not only in Gold suites (7/10) but across Silver and Bronze tiers as well. PostHog, Actual Budget, Supabase community, and Documenso all use `.spec.ts`. The only notable alternatives remain `.e2e.ts` (Cal.com) and `.e2e-spec.ts` (Immich). No new naming conventions were discovered in the validation sweep.
- **Evidence:** PostHog, Actual Budget, Supabase community, Documenso — all `.spec.ts`
- **Confidence:** High — pattern confirmed across 15+ suites

## Finding 2: `page-models/` or `pages/` directory naming is the universal POM directory convention

Every suite that uses class-based POM organizes page objects in either `pages/` or `page-models/` directories. PostHog uses `page-models/`, while community templates use `pages/`. No suite uses `page-objects/`, `pom/`, or other naming. The Gold suite variant `models/` (Grafana plugin-e2e) remains unique to framework-level packages.
- **Evidence:** PostHog (`page-models/`), ovcharski (`pages/`), ecureuill (`tests/pages/`), saucedemo (`tests/pages/`)
- **Confidence:** High — 2 naming conventions only: `pages/` (dominant) and `page-models/` (PostHog)

## Finding 3: BasePage inheritance is confirmed as a community-only anti-pattern

The validation sweep re-confirms that `extends BasePage` inheritance appears only in Bronze-tier community templates and boilerplate repos (ovcharski/playwright-e2e, community POM templates). No Silver or Gold production suite uses POM inheritance. This strengthens the round-20 finding that composition via fixtures is the production-grade pattern.
- **Evidence:** ovcharski/playwright-e2e uses BasePage inheritance. Zero Silver+ suites use it. PostHog, Actual Budget, Supabase — all avoid inheritance.
- **Confidence:** Very high — 0/22 production suites use POM inheritance

## Finding 4: Auto fixtures for auth are an emerging alternative to setup projects

PostHog migrated from setup projects to auto fixtures for authentication, moving auth logic from `auth.setup.ts` to `playwright-test-base.ts` as an auto fixture. This improves compatibility with `--ui` mode and makes auth more flexible. However, the setup project approach (Grafana, freeCodeCamp) remains the documented standard and is more visible in HTML reports.
- **Evidence:** PostHog PR #28641 — auto fixture auth replaces project dependencies for --ui mode compatibility
- **Confidence:** Medium — emerging pattern, not yet dominant

## Finding 5: Multi-environment config files (per-env dotenv) diverge from the Gold standard `process.env.CI` ternary

Enterprise-style templates (rishivajre framework) use separate config files per environment (dev.env.js, qa.env.js, staging.env.js, prod.env.js). This diverges from the Gold suite pattern where `process.env.CI` is the sole environment switch. The multi-file approach adds complexity and is not observed in any Gold or Silver production suite.
- **Evidence:** rishivajre template uses 4 env config files; 0/10 Gold suites use this pattern
- **Confidence:** High — multi-env config files are an enterprise template pattern, not a production pattern

## Finding 6: Auth-state filename qualifiers are a valid but uncommon naming convention

Supabase community uses auth-qualified filenames (`test-case.user.spec.ts` for authenticated tests vs `test-case.spec.ts` for public tests). This is a lightweight alternative to directory-based auth separation (logged-in/ vs logged-out/ directories). Neither approach is dominant — most suites rely on setup projects or fixtures rather than filename conventions.
- **Evidence:** Supabase community `.user.spec.ts` qualifier; Playwright official docs recommend directory separation
- **Confidence:** Medium — valid alternative, not a standard

## Finding 7: Domain-specific custom matcher packages are a reproducible pattern beyond Grafana

The `playwright-posthog` package publishes custom Playwright matchers for PostHog analytics event assertions, confirming that the Grafana plugin-e2e pattern (publishing domain-specific matchers as npm packages) is reproducible. This validates the highest maturity level (Level 4: Framework) as an achievable target for teams building domain-specific testing tools.
- **Evidence:** `playwright-posthog` — custom matchers for analytics events; `@grafana/plugin-e2e` — custom matchers for Grafana panels
- **Confidence:** High — two independent implementations of the same pattern

## Finding 8: Test type separation (e2e/ vs ui/ vs visual/ vs api/) is a Bronze-tier pattern absent from Gold suites

Community templates split tests into `e2e/`, `ui/`, `visual/`, and `api/` subdirectories. Gold suites organize by feature or application area instead (Grafana: `dashboards-suite/`, `alerting-suite/`; Cal.com: `auth/`, `eventType/`, `team/`). Feature-based organization scales better than type-based organization because features cross test types.
- **Evidence:** ecureuill uses e2e/ui/visual split; ovcharski uses api/e2e/ui split; 0/10 Gold suites use type-based directories
- **Confidence:** High — feature-based > type-based is a confirmed pattern in production
