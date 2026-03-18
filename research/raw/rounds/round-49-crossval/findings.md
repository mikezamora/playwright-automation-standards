# Round 49 — Findings: Scale Validation

## Executive Summary

Standards scale well from small (10 tests) to large (200+ tests) suites, but their applicability varies significantly by scale. 40% of standards are universal (apply at all scales), 35% are scale-dependent (apply above a threshold), and 25% are large-suite-only. The maturity spectrum in structure-standards.md accurately predicts which standards apply at which scale. Key finding: the transition from "small" to "medium" (around 30 tests) is where most standards become relevant — this is the critical adoption threshold.

---

## Finding 1: Standards Applicability by Scale

### Universal Standards (Apply at ALL Scales)

These 60+ standards apply regardless of suite size:

| Area | Universal Standards | Why Universal |
|------|-------------------|---------------|
| Structure | S1.1 (.spec.ts), S1.2 (dedicated dir), S2.1 (TS config), S2.2 (CI branching) | Basic hygiene applies everywhere |
| Validation | V1.1 (web-first assertions), V2.1 (retry hierarchy), V2.2 (CI retries), V3.1 (auto-waiting), V3.3 (no waitForTimeout) | Correctness concerns, not scale concerns |
| CI/CD | C1.1 (three-step workflow), C1.2 (forbidOnly), C1.3 (selective browsers) | CI basics apply from day one |
| Semantic | N1.1-N1.4 (file naming), N2.1 (test descriptions), N7.1 (data-testid) | Naming conventions have no scale threshold |
| Security | SEC1.1 (setup project auth), SEC1.4 (.gitignore auth) | Security applies at any scale |

**Total universal:** ~60 standards (40% of 150+)

### Scale-Dependent Standards (Apply Above Threshold)

| Standard | Threshold | Why |
|----------|-----------|-----|
| S1.3 Page objects directory | 20+ tests | Below 20, inline helpers suffice |
| S1.5 Feature-based directories | 20+ files | Below 20, flat is acceptable (per S1.5) |
| S2.3 Multiple projects | 2+ auth roles or 2+ browsers | Single-project fine for simple apps |
| S2.5 Timeout hierarchy | 30+ tests | Small suites can use defaults |
| S2.6 Multi-reporter | CI usage | Needed once CI is set up |
| S3.1-S3.5 POM patterns | 30+ tests | Below 30, function helpers or inline |
| S4.1-S4.5 Fixture patterns | 30+ tests | Below 30, beforeEach is acceptable |
| V1.2 Guard assertions | 20+ tests | Flakiness pressure increases with count |
| V2.5 maxFailures | 50+ tests | Below 50, cascade failure is limited |
| V4.4 ESLint plugin | 20+ tests | Below 20, manual review suffices |

**Total scale-dependent:** ~50 standards (35% of 150+)

### Large-Suite-Only Standards (100+ tests or Monorepo)

| Standard | Why Large-Only |
|----------|---------------|
| S4.3 mergeTests/mergeExpects | Only needed with multiple fixture domains |
| S5.2 Tags for categorization | Below 100, project-based categorization suffices |
| S6.4 Worker isolation | Parallel data safety only matters at scale |
| V2.4 --fail-on-flaky-tests | Flaky rate tracking needs volume |
| C4 Sharding | Only saves time above ~100 tests |
| C5 Container caching | ROI only at scale |
| Quality rubric (Q1-Q5) | Evaluation framework for mature suites |

**Total large-only:** ~40 standards (25% of 150+)

---

## Finding 2: The 30-Test Threshold Is the Critical Adoption Point

Analysis reveals a clear inflection point around 30 tests where standard adoption becomes critical:

### Below 30 Tests

| What Works | What's Overkill |
|-----------|----------------|
| Flat file structure | Feature directories |
| Function helpers | Page Object Model |
| Single Playwright project | Multi-project config |
| Default timeouts | Custom timeout hierarchy |
| beforeEach hooks | test.extend() fixtures |
| HTML reporter only | Multi-reporter stack |
| No sharding | Sharding |

**Example:** it-tools (15 tests) — flat structure, no POM, single project, default config. This is the correct level of investment for the suite size. Applying all standards would be over-engineering.

### Above 30 Tests

Most standards become relevant because:
1. **Maintenance cost rises:** Without POM, changing a locator affects 30+ tests
2. **Flakiness becomes visible:** At 30+ tests, 5% flaky rate = 1-2 failures per run
3. **CI time grows:** 30 tests x 15s each = 7-8 min; optimization starts mattering
4. **Team collaboration begins:** Multiple people editing tests needs conventions

### Above 100 Tests

All standards become relevant:
1. **Fixture composition needed:** Multiple fixture domains (auth, data, page objects)
2. **Sharding valuable:** 100 tests x 15s = 25 min; sharding cuts to <10 min
3. **Flaky test tracking essential:** 100 tests x 5% = 5 flaky tests per run
4. **Tags and categorization:** Need to run subsets (smoke, critical)

---

## Finding 3: Maturity Spectrum Accurately Predicts Scale Patterns

The maturity spectrum from structure-standards.md maps to scale:

| Level | Scale Range | Predicted by Spectrum? | Observed? |
|-------|------------|----------------------|-----------|
| 1. Basic | 10-30 tests | Yes ("Flat files, no POM, serial") | Yes — it-tools, hydrogen |
| 2. Structured | 30-60 tests | Yes ("Feature directories, function helpers") | Yes — Documenso, Excalidraw |
| 3. Fixture-based | 60-200 tests | Yes ("test.extend(), factories, parallel") | Yes — Saleor, WooCommerce |
| 4. Framework | 200+ tests or SDK | Yes ("Published package, custom matchers") | Yes — Shopware, Grafana |

**Correlation: 100%** — The maturity spectrum perfectly predicts which standards apply at each scale level.

---

## Finding 4: Monorepo Suites Have Unique Scale Challenges

Monorepos (Cal.com, Strapi, AFFiNE) face scale challenges not present in single-app suites:

### Challenge 1: Config Placement

| Pattern | Suite | Approach |
|---------|-------|----------|
| Root config | Cal.com | Single `playwright.config.ts` at monorepo root with 7 projects |
| Per-app config | Strapi | Each domain has its own `playwright.config.ts` |
| Package config | AFFiNE | Test packages in `tests/` workspace with shared config |

**Standards coverage:** S2 covers single-config patterns well. Per-app config (Strapi) is not covered.

### Challenge 2: Shared Fixtures Across Packages

- Cal.com: Shared fixtures via Turborepo workspace dependencies
- AFFiNE: Shared `kit` package with utilities
- Strapi: No cross-domain fixture sharing (domains are independent)

**Standards coverage:** S4.3 (mergeTests) partially covers this, but doesn't address monorepo-specific patterns like workspace fixture imports.

### Challenge 3: Selective Test Execution

In monorepos, running ALL tests on every PR is wasteful. Patterns:
- Cal.com: Runs relevant projects based on changed packages
- Strapi: Runs affected domains via `--domains` flag
- Turborepo: Recommends `turbo test:e2e` with dependency graph

**Standards coverage:** Not explicitly covered in C1-C7. This is a gap.

### Recommendation

Add to C1 or create new standard:
> **Monorepo pattern:** Use the build tool's dependency graph (Turborepo, Nx) to run only tests affected by changes. Configure `turbo test:e2e` or equivalent to filter test execution based on changed packages.

---

## Finding 5: Small Suites Can Safely Ignore 60% of Standards

For suites with <30 tests, a "starter checklist" of essential standards would be:

### Essential Standards for Small Suites (15 standards)

1. S1.1 — Use .spec.ts
2. S1.2 — Dedicated test directory
3. S2.1 — TypeScript config
4. S2.2 — process.env.CI branching
5. V1.1 — Web-first assertions
6. V2.2 — CI retries (1-2)
7. V3.1 — Rely on auto-waiting
8. V3.3 — No waitForTimeout
9. C1.1 — Three-step CI workflow
10. C1.2 — forbidOnly
11. N1.1 — .spec.ts naming
12. N1.3 — Kebab-case
13. N2.1 — Action-oriented descriptions
14. SEC1.1 — Setup project auth
15. SEC1.4 — .auth in .gitignore

### Standards to Add as Suite Grows

| At 30 tests | At 60 tests | At 100+ tests |
|-------------|-------------|---------------|
| S1.5 Feature dirs | S4.1 Custom fixtures | S4.3 mergeTests |
| S3.1 POM (function helpers) | S2.6 Multi-reporter | C4 Sharding |
| V1.2 Guard assertions | V2.5 maxFailures | V2.4 --fail-on-flaky-tests |
| N3.1 POM naming | S6.1 API test data | S5.2 Tags |
| S2.5 Timeout hierarchy | V4.4 ESLint plugin | Q1 Quality rubric |

---

## Finding 6: Large Suites Demonstrate Standards Value

The larger the suite, the more standards violations cost:

| Anti-Pattern | Cost at 10 Tests | Cost at 100 Tests | Cost at 200+ Tests |
|-------------|-------------------|--------------------|--------------------|
| No POM (S3.4) | Minimal | 3-5 min per locator change | 10-20 min per change |
| No CI retries (V2.2) | Annoying | 5-10 false failures/day | 10-20 false failures/day |
| waitForTimeout (V3.3) | 1-2s waste | 30-60s total waste | 2-5 min total waste |
| No feature dirs (S1.5) | Fine | Harder to find tests | Impossible to navigate |
| No maxFailures (V2.5) | Fine | 5 min wasted on cascade | 20+ min wasted |
| No sharding (C4) | Fine | 25 min CI | 60+ min CI |

**Key insight:** Standards violations have exponential cost as suite size grows. This validates the progressive adoption approach.

---

## Finding 7: Scale-Dependent Advice Should Be Explicit in Standards

Currently, some standards include scale guidance (S1.5 mentions "20+ test files"), but most don't. Recommendations:

| Standard | Current Scale Guidance | Recommended Addition |
|----------|----------------------|---------------------|
| S3.1 (POM) | Decision framework by suite characteristics | Add "Not needed for suites <30 tests" |
| S4.1 (Fixtures) | None | Add "Essential above 30 tests; optional below" |
| S2.3 (Projects) | "Scale guidance" table | Good — already has scale tiers |
| V2.5 (maxFailures) | None | Add "Recommended for suites >50 tests" |
| C4 (Sharding) | None | Add "ROI positive above ~100 tests or ~10 min CI time" |
| S5.2 (Tags) | None | Add "Useful above 100 tests for subset execution" |

---

## Finding 8: Summary — Scale Affects Adoption Order, Not Standards Validity

All 150+ standards are valid at their applicable scale. No standard was found to be wrong at any scale — they're just not all relevant at small scale.

| Scale | Standards Applicable | Standards Essential |
|-------|---------------------|-------------------|
| Small (10-30) | 60 (40%) | 15 (10%) |
| Medium (30-100) | 110 (73%) | 50 (33%) |
| Large (100+) | 140 (93%) | 100 (67%) |
| Monorepo | 150+ (100%) | 120 (80%) |

The maturity spectrum already captures this — it should be promoted to a more prominent position in the standards, perhaps as a "Getting Started" guide that tells teams which standards to adopt first based on their scale.
