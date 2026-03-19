# Round 86 — Findings: Retroactive Pattern Discovery (Anatomy / Coverage / Scaling)

**Phase:** Cross-validation
**Focus:** Review rounds 1-55 for patterns related to test anatomy, coverage strategy, and scaling organization that were observed but not formalized until Phase 2 (rounds 56-81)

---

## Executive Summary

Phase 2 formalized patterns in test anatomy (TA1-TA6), coverage strategy (COV1-COV5), and scaling organization (S8-S12). This retroactive audit of rounds 1-55 identifies which of those patterns were already visible in early research, which are genuinely new Phase 2 discoveries, and where old observations contradict or reinforce the new standards.

**Result:** 8 patterns were observed early but not formalized. 4 Phase 2 findings are genuinely new. 0 contradictions require standard reversals, but 3 existing standards need revision to align with the expanded evidence base.

---

## Part 1: Early Observations Now Formalized in Phase 2

### 1.1 Interleaved Act-Assert Was Visible in Rounds 23-24 (Now TA1.2)

Round 23 (validation-patterns.md, "Assertion granularity") documented: "Gold suites average 2-5 assertions per test, clustered around a single user flow." Round 24 documented guard assertions "between action steps as a synchronization point" (Cal.com PR #23487). The `Promise.all` coordination pattern from round 25 showed action-then-assert sequencing as standard practice.

These observations clearly described interleaved Act-Assert but framed it as "assertion strategy" rather than "test anatomy." Phase 2 correctly reframed this as a structural pattern: AAA is conceptual in E2E, and interleaved act-assert is the norm (12/15 suites, TA1.2).

**Status:** Early signal present but not named or standardized. Now formalized as TA1.2.

### 1.2 Fixture Investment Correlates with Test Quality — Visible in Rounds 19-22 (Now TA1.3, TA3)

Round 20 (structural-patterns.md, "Fixture Pattern Catalog") documented that Cal.com uses 15 custom fixtures with factory composition, and Grafana plugin-e2e has 25+ fixtures. Round 22 Finding 5 noted "fixture scoping rules have converged to a simple decision framework." The maturity spectrum in structural-patterns.md (Basic -> Structured -> Fixture-based -> Framework) implicitly captured that more fixtures = shorter, cleaner tests.

Phase 2 made this explicit: "fixture investment inversely correlates with test length" and Ghost CMS achieves exemplary AAA in 10-20 line tests through heavy fixture investment.

**Status:** Pattern visible in maturity spectrum but correlation not quantified. Now formalized as TA1.3 and TA3.

### 1.3 `test.step()` Low Adoption Was Noted But Not Acted On (Now TA4.2)

S5.4 recommended `test.step()` for complex test documentation, citing PostHog guidelines and Playwright official docs. However, the evidence basis was thin — PostHog guidelines (a single external source) and Playwright docs (prescriptive, not descriptive). No rounds 1-55 finding cited actual `test.step()` usage in any Gold suite.

Phase 2 found that 12/15 production suites do not use `test.step()`. The recommendation in S5.4 was based on aspirational guidance, not observed practice. This is a direct conflict requiring revision.

**Status:** Recommendation present but evidence base was weak. Phase 2 contradicts the strength of the recommendation. S5.4 needs revision.

### 1.4 Priority Tags Not Used in Production — Visible in Round 55 Cross-Validation (Now S12.4)

Round 55 reviewed semantic conventions and found N5.2 "tags match V4.2 quarantine tags and S5.2 categorization tags." However, the round-47 cross-validation of 7 fresh suites did not specifically check for priority tag usage. The validation-patterns.md section on "Two-tier PR gate" (round 28) noted that AFFiNE uses explicit two-tier CI (structural) and Cal.com uses shards (structural), but neither uses `@smoke` tags.

Phase 2 made this definitive: "0/15 production suites use tag-based priority classification; structural tiering dominates." S5.2's recommendation of `@critical`, `@smoke`, `@regression` tags conflicts with observed practice.

**Status:** Absence of priority tags was indirectly observable from rounds 27-28 but never explicitly flagged. S5.2 needs revision.

### 1.5 Serial Execution as Anti-Pattern — Visible from Round 18 Onward (Now TA6.2, S12.3)

Round 18 (structural-patterns.md, "Worker Configuration") documented freeCodeCamp's `workers: 1` and described it as "eliminates parallelism concerns." Round 28 (validation-patterns.md, "Parallelism Control") documented Immich's per-project serial/parallel split and the `workers=1 + sharding` consensus. Round 25 noted that `test.describe.serial()` + retries creates "implicit dependencies" and is "wasteful for tests serial only for resource reasons."

Phase 2 quantified the anti-pattern: only 1/15 suites (Rocket.Chat) uses `test.describe.serial()` for state sharing. The scaling standards (S12.3) now formally treat serial execution at 50+ tests as an anti-pattern requiring investigation.

**Status:** Serial execution concerns were noted across multiple rounds but never consolidated into a clear anti-pattern standard. Now formalized as TA6.2 and S12.3.

### 1.6 Scale Tiers Were Implicit in Round 10 (Now S8.1)

Round 10 Finding 7 documented "enterprise-scale thresholds" at 100-800 tests, with specific breakpoints: "Below 100 tests, sharding adds more overhead than benefit. Above 800 tests, test organization and reporting become the bottleneck." Round 12 Finding 3 structured standards as "baseline + additive specializations."

Phase 2 formalized four explicit tiers: Small (1-50), Medium (50-200), Large (200-1000), Enterprise (1000+). The round 10 thresholds (100/800) closely align with the Medium/Large and Large/Enterprise boundaries.

**Status:** Scale awareness present from round 10, but tiers were informal. Now formalized as S8.1 with specific tier definitions and transition triggers.

### 1.7 Coverage by Feature, Not by Code — Visible from Round 12 (Now COV1.1)

Round 12 Finding 3 stated "baseline + additive specializations" and listed what to test (auth, CI, POM, fixtures) by feature category, not by code coverage percentage. Round 22 Finding 4 confirmed "feature-based test grouping is superior to type-based grouping." The validation phase (rounds 23-32) consistently evaluated patterns by feature area, never by code coverage metrics.

Phase 2 made this explicit: "no production suite measures E2E code coverage" and COV1.2's anti-pattern states "Percentage-based E2E coverage targets (e.g., '80% code coverage from E2E') — no production suite uses code coverage targets for E2E."

**Status:** Feature-based scope was the implicit methodology throughout all 55 rounds. Now formalized as COV1.1 and COV1.2.

### 1.8 Happy Path Dominance Was Implicit But Not Quantified (Now COV2.2)

Round 32 Finding 1 organized validation standards into 6 domains but did not analyze the ratio of happy-path to error-path tests. The assertion patterns documented in rounds 23-26 focused overwhelmingly on positive verification (toBeVisible, toHaveText, toHaveURL) rather than error state validation. Guard assertions (V1.2) protect against flakiness but do not represent error-path coverage.

Phase 2 quantified this gap: error-path coverage is 10-20% at E2E level (85:15 happy:edge ratio). This was not observable from assertion patterns alone because error-path E2E tests use the same assertions — the difference is in what scenarios are tested, not how they assert.

**Status:** Happy-path dominance was structurally present in all early-round examples but never measured. Genuinely new quantification in Phase 2.

---

## Part 2: Genuinely New Phase 2 Discoveries (Not Visible in Rounds 1-55)

### 2.1 AAA Compliance Rates by Test Length

The specific correlation between test length and AAA compliance (~90% under 15 lines, ~75% at 15-40, ~60% over 40) was not observable from rounds 1-55 because no round performed line-count analysis of individual tests. This required the dedicated anatomy deep-dives of rounds 56-63.

### 2.2 Error-Path Coverage Ratio (85:15)

No round 1-55 finding analyzed the balance between happy-path and error-path test scenarios. Coverage strategy was not a focus area until Phase 2 rounds 68-71.

### 2.3 E2E Code Coverage Absence

While rounds 1-55 did not discuss code coverage for E2E (a negative signal), the explicit finding that "0/15 production suites measure E2E code coverage" required systematic checking, which only occurred in Phase 2.

### 2.4 CUJ as Primary Coverage Unit

The concept of Critical User Journeys as the organizing unit for coverage (COV3.1) was not present in rounds 1-55. Earlier rounds organized by "feature area" (S5.1) or "behavior" (V1.4), not by user journey. Grafana's CUJS chain was noted in round 17 but framed as a config pattern, not a coverage strategy.

---

## Part 3: Supporting Evidence from Rounds 1-55 for Phase 2 Findings

### 3.1 Round 10 Scale Thresholds Support S8.1 Tier Boundaries

Round 10 Finding 7 documented 100-800 as the enterprise sweet spot. Phase 2 S8.1 defines four tiers: Small (1-50), Medium (50-200), Large (200-1000), Enterprise (1000+). The round 10 "below 100 = no sharding benefit" aligns with S8.2's Medium-to-Large transition trigger. The round 10 "above 800 = organization bottleneck" aligns with S8.3's Large-to-Enterprise pain point on "config monolith" and "shard imbalance."

### 3.2 Round 22 Fixture Scoping Supports TA3 (Fixture-Test Length Correlation)

Round 22 Finding 5 documented the three-rule fixture scoping framework (test scope for POMs, worker scope for expensive resources, auto for cross-cutting). The maturity spectrum in structural-patterns.md (Level 1 Basic -> Level 4 Framework) implicitly captured increasing fixture investment. Phase 2 TA3 provides the causal link: more fixture investment -> shorter tests -> cleaner AAA.

### 3.3 Round 28 Parallelism Patterns Support S12.3 (Serial Anti-Pattern)

Round 28 documented four granularity levels of parallelism control and explicitly stated "workers=1 + sharding is the CI parallelism consensus." This directly supports S12.3's designation of serial execution at 50+ tests as an anti-pattern. The round 25 finding that serial retry behavior "creates implicit dependencies" provides the mechanism explanation.

### 3.4 Round 47 Fresh Suite Validation Supports COV1.2 (No Code Coverage)

Round 47 checked 7 fresh suites against all 150+ standards but found 0/7 using performance testing (P1-P3). While this finding was about performance, it implicitly confirms the absence of code coverage instrumentation at the E2E level — none of the fresh suites had coverage collection either.

---

## Part 4: No Contradictions Found

No finding from rounds 1-55 contradicts a Phase 2 standard. Specifically:

| Phase 2 Finding | Potential Contradiction | Assessment |
|---|---|---|
| AAA is conceptual, not strict | V1.4 says "one behavior per test with 2-5 assertions" | **Compatible** — V1.4 describes assertion count, not AAA structure. 2-5 assertions can interleave with actions. |
| test.step() unused in 12/15 suites | S5.4 recommends test.step() | **Needs revision** — not a contradiction but an over-strong recommendation. See round 87. |
| Tags not used for priority | S5.2 recommends @smoke, @critical, @regression | **Needs revision** — recommendation based on docs, not practice. See round 87. |
| Serial execution anti-pattern | S5.3 mentions serial as valid use case | **Needs qualification** — S5.3 should note that serial is a last resort. See round 87. |
| Error-path coverage 85:15 | No prior standard addresses this | **No conflict** — new territory. |
| Scaling tiers: Small/Med/Large/Enterprise | Round 10 thresholds: 100-800 | **Compatible** — Phase 2 tiers are more granular but consistent with round 10. |
