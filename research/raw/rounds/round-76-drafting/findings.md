# Round 76 Findings: Drafting TA1-TA3

## Methodology

Drafted standards TA1 (Arrange-Act-Assert), TA2 (Single Responsibility), and TA3 (Test Step Usage) based on synthesis from anatomy-patterns.md, round-63 audit-notes.md, round-66 assertion findings, and round-67 independence/nesting findings.

---

## Drafting Decisions

### TA1: Arrange-Act-Assert Pattern (3 sub-standards)

**TA1.1 — AAA as conceptual framework:** Positioned AAA as a "conceptual framework, not a rigid structural rule" based on the finding that strict compliance varies 60-90% by test length across 15 suites. Avoided recommending strict all-assertions-at-end, which is impractical for E2E per the interleaving evidence (12/15 suites).

**TA1.2 — Interleaved Act-Assert:** Elevated this from an "acceptable deviation" to a recommended pattern for multi-step flows. The evidence is overwhelming (12/15 suites) and Grafana's dashboard-view chaining pattern is representative. Included a code example showing the three Act-Assert pairs pattern.

**TA1.3 — Fixture-driven Arrange:** Made this the primary recommendation for clean AAA separation based on Ghost CMS exemplary data (10-20 line avg tests with clean AAA) and the 8/15 suites using fixture-driven arrangement. Cited grafana-plugin-e2e as "cleanest observed" per the synthesis data.

### TA2: Single Responsibility (4 sub-standards)

**TA2.1 — Short focused tests under 30 lines:** Set the threshold at 30 lines based on the 9/15 suites following the many-short-tests philosophy. Added an examine-at-50 and justify-at-80 escalation. Included the test length distribution table from synthesis data.

**TA2.2 — Fixture investment as enabler:** Made this a dedicated sub-standard because the synthesis identified fixture investment as "the strongest predictor of test length." Included a before/after code example (40+ lines vs 8 lines) to make the impact visceral.

**TA2.3 — Bundle vs split decision framework:** Created a 5-factor decision table based on the observed split between many-short-tests (9/15) and fewer-longer-tests (6/15) philosophies. Added the "when in doubt, split" rule of thumb.

**TA2.4 — Tests-per-file ratios:** Added guidance for 3-10 tests per file based on the distribution data. Called out the Supabase filter-bar (39 tests in one file) as the extreme anti-pattern.

### TA3: Test Step Usage (3 sub-standards)

**TA3.1 — Reserve test.step() for CUJ tests:** Set the threshold at ~50 lines based on the finding that only 3/15 suites use test.step() at <20% adoption. This is the strongest "community disagrees with production" finding.

**TA3.2 — Prefer splitting over stepping:** Made this a separate sub-standard because the alternatives table (short tests 15/15, nested describes 7/15, flat file-per-feature 4/15, parametric 2/15) deserves its own evidence presentation.

**TA3.3 — Descriptive step names:** Brief sub-standard covering the naming convention divergence (Grafana numbered, Cal.com descriptive, Rocket.Chat action-based). Recommended descriptive phrases as default.

## Evidence Gaps

None. All TA1-TA3 standards have evidence from 12+ suites.
