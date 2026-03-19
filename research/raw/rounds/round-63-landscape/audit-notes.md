# Round 63 — Audit Notes

## Standards Evidence Assessment

### Test Anatomy Standards (TA1-TA6)

| Proposed Standard | Evidence | Suites | Status | Notes |
|-------------------|----------|--------|--------|-------|
| **TA1: AAA Pattern** | 15/15 suites demonstrate AAA as conceptual framework; strict compliance varies 60-90% by test length | 15 | **Ready to draft** | Key nuance: strict AAA is impractical for E2E; recommend "conceptual AAA with interleaved assertions acceptable in multi-step flows" |
| **TA2: Short Focused Tests** | 12/15 suites have zero test.step(); 3/15 use it sparingly (<20% of files); median test length 15-30 lines | 15 | **Ready to draft** | Recommend: prefer short tests (<30 lines); reserve test.step() for CUJ tests exceeding 50 lines |
| **TA3: Fixture-Driven Setup** | 12/15 suites use fixtures or rich utilities; strong inverse correlation between fixture investment and test length | 15 | **Ready to draft** | Five tiers of setup complexity identified (navigation-only through full-stack isolation); recommend tier selection based on product complexity |
| **TA4: Assertion Density** | Cross-suite average 3-5 assertions/test; custom matchers reduce count in SDK suites | 15 | **Ready to draft** | Recommend 2-8 assertions for standard tests; custom matchers for repeated patterns; no hard upper limit for CUJ tests |
| **TA5: Test Independence** | 14/15 suites achieve independence; only Rocket.Chat uses serial for state sharing; multiple isolation patterns documented | 15 | **Ready to draft** | Six isolation approaches cataloged (per-test creation, per-worker container, per-file environment, DB reset, unique names, fresh app) |
| **TA6: Describe Nesting Depth** | Range from 0 (AFFiNE) to 4 (Next.js); insufficient data on maintainability correlation | 15 | **Needs deep dive** | Most suites use 1-2 levels; deeper nesting correlates with parametric testing (describe.each) |

### Coverage Standards (COV1-COV5)

| Proposed Standard | Evidence | Suites + Resources | Status | Notes |
|-------------------|----------|-------------------|--------|-------|
| **COV1: Coverage Scope Definition** | 15 suites show CUJ / feature-based scoping; 17 community guides confirm risk-based prioritization | 15 + 17 | **Ready to draft** | Consensus: define scope by "critical user journeys" / "money paths"; never target code coverage percentages for E2E |
| **COV2: Test Tier Organization** | 13/15 use structural only; 2/15 add tags for multi-context; 4 community suites demonstrate tiering | 15 + 4 | **Ready to draft** | Two valid approaches: structural (recommended for production) and tag-based (valid for multi-context execution). Recommend structural as primary. |
| **COV3: Tiered CI Execution** | Only 2/15 implement two-tier CI; 9/15 run all tests always; community strongly recommends tiering | 15 + 17 | **Needs more evidence** | Gap between recommendation and practice. Need to understand why most suites skip tiering. May be appropriate for suites >200 tests. |
| **COV4: Error/Edge Case Scope** | 85:15 average ratio across 15 suites; API tests achieve 30% error coverage; UI tests 5-15% | 15 | **Ready to draft** | Recommend: 10-20% error-path target at E2E; focus on permission enforcement, empty states, critical recovery flows; delegate rest to lower layers |
| **COV5: Coverage Measurement** | 13/15 suites have zero formal measurement; only n8n has weekly coverage workflow; no suite uses code coverage for E2E | 15 + 6 tools | **Ready to draft** | Honest recommendation: structural completeness as heuristic; feature-map YAML as optional enhancement; code coverage NOT recommended for E2E |

### Scaling Standards (S8-S12)

| Proposed Standard | Evidence | Suites | Status | Notes |
|-------------------|----------|--------|--------|-------|
| **S8: Page Object Architecture** | 3 distinct POM strategies identified (fragment-maximalist, published package, thin-pages-plus-plugins); POM:spec ratio 0.04-0.66 | 10 | **Needs deep dive** | Need to correlate POM strategy with suite scale, team size, and maintenance burden |
| **S9: Data Management Strategy** | Ghost data factory (dual persistence), n8n JSON+API, Immich generators, Cal.com Prisma direct access; 5 approaches cataloged | 12 | **Needs deep dive** | Need to determine when each approach is appropriate based on test isolation requirements |
| **S10: Test Environment Isolation** | 6 isolation levels identified (per-test through container-per-worker); complexity scales with product architecture | 15 | **Needs deep dive** | Need cost/benefit analysis of each isolation level |
| **S11: CI Sharding Strategy** | Ratio ~1 shard per 50-100 tests; range from 0 shards (35 tests) to 200 jobs (10,000 tests) | 15 | **Needs deep dive** | Need to factor in per-test overhead (server startup, DB reset) not just test count |
| **S12: Monorepo Test Distribution** | Ghost distributes (6+ configs); others centralize; all 5 new suites are monorepos | 10 | **Needs deep dive** | Need to investigate team ownership models and their effect on test distribution |

## Summary

| Category | Ready to Draft | Needs Deep Dive |
|----------|---------------|-----------------|
| Test Anatomy (TA) | 5 (TA1-TA5) | 1 (TA6) |
| Coverage (COV) | 4 (COV1, COV2, COV4, COV5) | 1 (COV3) |
| Scaling (S) | 0 | 5 (S8-S12) |
| **Total** | **9** | **7** |

---

## Surprises and Contradictions

### Surprise 1: Tags Are Not Used for Priority Classification
Every community resource recommends `@smoke`, `@critical`, `@regression` tags. Zero production suites use priority tags. Tags appear only for browser/server exclusion (Element Web, Gutenberg) or fixture control (n8n `@auth:none`). This is the largest gap between recommendation and practice found in the entire research.

**Resolution hypothesis:** Product teams encode priority through directory structure and CI workflow configuration, making tag-based priority redundant. Tags become necessary only when the same test must run in different execution contexts (multiple browsers, multiple servers).

### Surprise 2: test.step() Is Essentially Not Adopted
Despite being a first-class Playwright API and frequently recommended in documentation, test.step() is used by only 3/15 suites at <20% adoption within those suites. The production consensus is overwhelmingly "write shorter tests" rather than "subdivide long tests with steps."

### Surprise 3: No Suite Measures E2E Coverage
Coverage measurement tools exist (V8, Istanbul, feature-map) but no production suite uses them. This suggests the industry has not yet found a practical coverage metric for E2E tests. Structural completeness (feature per directory) serves as the implicit proxy.

### Surprise 4: Serial Execution Is Not Dead
Rocket.Chat and freeCodeCamp (and Gutenberg to a lesser extent with `workers: 1`) still rely on serial execution. In Rocket.Chat's case, this is a deliberate cost-optimization for expensive channel creation. This challenges the assumption that parallel execution is universally required.

### Contradiction 1: Community Recommends Tags, Production Uses Structure
The evidence clearly shows two valid approaches that serve different needs. Tags work for multi-context execution and smaller QA-managed suites. Structure works for product-team-managed suites and large-scale organizations. Both should be recognized as valid in the standard, with structural recommended as the default for production suites.

### Contradiction 2: Error-Path Coverage -- Aspiration vs Reality
Community guides describe comprehensive error-path testing at E2E. Production suites consistently show 5-15% error coverage at the UI layer. The resolution: E2E error testing should focus on the small set of errors visible to users (permission denials, empty states, critical failure recovery). Most error-path testing belongs at lower layers.

### Contradiction 3: CUJ Tests vs Short Focused Tests
TA2 recommends short tests, but Grafana's CUJ tests (100+ lines with numbered steps) are among the highest-value tests in any suite. The resolution: CUJ tests are an intentional exception. The standard should define CUJ tests as a distinct category with different rules (steps allowed, higher assertion counts, longer test bodies).

---

## Proposed Standard Decomposition Assessment

### Is the TA1-TA6 / COV1-COV5 / S8-S12 Decomposition Correct?

**Mostly yes, with adjustments:**

1. **TA1-TA5 are well-scoped and well-evidenced.** Each covers a distinct concern with clear evidence.

2. **TA6 (Describe Nesting) may be too narrow to be its own standard.** Consider merging into TA2 (Short Focused Tests) as a sub-recommendation on test organization alternatives to test.step(). The nesting depth question is really about "how do you organize tests within a file?" which is part of the same concern as test.step().

3. **COV1-COV2 are strong.** Coverage scope definition and tier organization have the most evidence.

4. **COV3 (Tiered CI) may need to become a conditional standard:** "Implement tiered CI execution when suite exceeds N tests or M minutes." Most suites under 200 tests do not need tiering.

5. **COV4-COV5 are honest assessments of reality.** The candid finding that error coverage is 5-15% and measurement is non-existent should be reflected as pragmatic guidance, not aspirational targets.

6. **S8-S12 all need deep dives.** Scaling patterns vary enormously by product architecture. These cannot be standardized from landscape data alone -- they require deep dives into the relationship between architecture choices and their consequences.

7. **Consider adding TA7: Cleanup Pattern** as a new standard. The variety of cleanup approaches (afterEach, async disposable, container reset, DB reseed, no cleanup) is significant enough to warrant its own recommendation. Evidence from 15 suites shows 6 distinct cleanup strategies.

8. **Consider adding COV6: Multi-Layer E2E Testing** as a new standard. Ghost, Immich, Next.js, and n8n all maintain multiple E2E layers (API, UI, integration, performance). This multi-layer pattern is distinct from test tier organization and deserves its own guidance.
