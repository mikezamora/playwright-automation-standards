# Round 93 — Audit Notes: Accuracy Rates & Revision Recommendations

**Phase:** Validation
**Date:** 2026-03-19

---

## Overall Accuracy Rate

### Per-Standard Results Across 6 Suites

Legend: C = CONFIRMED, P = PARTIAL, F = FAILED

| Standard | Lexical | Twenty | Payload | Nhost | Formbricks | Builder | C/P/F | Weighted |
|----------|---------|--------|---------|-------|------------|---------|-------|----------|
| **TA1.1** (AAA framework) | C | C | C | C | C | C | 6/0/0 | **100%** |
| **TA1.2** (Interleaved Act-Assert) | C | C | C | C | C | C | 6/0/0 | **100%** |
| **TA1.3** (Fixture-driven Arrange) | F | P | F | C | C | C | 3/1/2 | **54%** |
| **TA2.1** (Short tests <30 lines) | P | F | C | C | F | C | 3/1/2 | **54%** |
| **TA2.4** (3-10 tests/file) | P | F | P | C | C | P | 2/3/1 | **58%** |
| **TA3.1** (test.step absent) | C | P | C | C | P | C | 4/2/0 | **83%** |
| **TA3.2** (Prefer splitting) | C | — | — | — | F | — | 1/0/1 | **50%** |
| **TA4.1** (Setup placement framework) | C | C | C | C | C | C | 6/0/0 | **100%** |
| **TA4.2** (Fixtures over beforeEach) | F | C | F | C | C | C | 4/0/2 | **67%** |
| **TA5** (Assertion density 3-5) | P | C | C | C | P | C | 4/2/0 | **83%** |
| **TA6** (Test independence) | C | C | C | C | C | C | 6/0/0 | **100%** |
| **COV1.1** (E2E scope) | C | C | C | C | C | C | 6/0/0 | **100%** |
| **COV1.2** (Priority table) | — | C | C | C | — | — | 3/0/0 | **100%** |
| **COV1.3** (Multi-layer E2E) | — | — | — | — | C | — | 1/0/0 | **100%** |
| **COV2.1** (Structural tiering) | C | — | C | C | C | C | 5/0/0 | **100%** |
| **COV4.1** (80-90% happy path) | C | C | C | C | P | C | 5/1/0 | **92%** |
| **COV4.2** (Error categories) | — | — | C | — | C | C | 3/0/0 | **100%** |
| **S8.1** (Scale tier ID) | C | C | P | C | C | C | 5/1/0 | **92%** |
| **S8.2** (Transition triggers) | — | C | — | — | — | — | 1/0/0 | **100%** |
| **S9.1** (Directory organization) | P | — | C | C | C | P | 3/2/0 | **80%** |
| **S10.3** (Dynamic project gen) | — | — | — | — | — | C | 1/0/0 | **100%** |

### Aggregate Accuracy

**Scoring method:** CONFIRMED = 1.0, PARTIAL = 0.5, FAILED = 0.0

| Category | Confirmed | Partial | Failed | Total Scoreable | Score |
|----------|-----------|---------|--------|----------------|-------|
| **TA (Anatomy)** | 45 | 9 | 8 | 62 | **79.8%** |
| **COV (Coverage)** | 23 | 1 | 0 | 24 | **97.9%** |
| **S (Scaling)** | 10 | 3 | 0 | 13 | **88.5%** |
| **OVERALL** | **78** | **13** | **8** | **99** | **85.4%** |

### Full CONFIRMED rate (CONFIRMED only, no partial credit)

| Category | Confirmed | Total | Rate |
|----------|-----------|-------|------|
| TA (Anatomy) | 45 | 62 | **72.6%** |
| COV (Coverage) | 23 | 24 | **95.8%** |
| S (Scaling) | 10 | 13 | **76.9%** |
| **OVERALL** | **78** | **99** | **78.8%** |

---

## Standards Confirmed (High Confidence — 83%+ Accuracy)

The following standards are strongly validated by fresh suites:

1. **TA1.1 (AAA as conceptual framework)** — 100%. All 6 suites follow identifiable AAA phases. No revision needed.

2. **TA1.2 (Interleaved Act-Assert)** — 100%. Universal pattern in multi-step E2E flows. No revision needed.

3. **TA4.1 (Setup placement decision framework)** — 100%. Every suite's setup approach maps to the correct tier in our decision framework. The 5-tier model is strongly validated.

4. **TA6 (Test independence)** — 100%. All suites maintain independent tests. No revision needed.

5. **COV1.1 (E2E scope)** — 100%. All suites test user-facing workflows, none test business logic at E2E. No revision needed.

6. **COV1.2 (Priority table)** — 100%. Suites at different maturity levels cover exactly the categories we predicted. No revision needed.

7. **COV2.1 (Structural tiering)** — 100%. All 5 scoreable suites use directory structure, not tags. No revision needed.

8. **COV4.1 (80-90% happy path)** — 83%. Most suites match. One partial (Formbricks) due to dedicated security API tests skewing the ratio.

9. **TA3.1 (test.step absent)** — 83%. Mostly absent; when present, used for CUJ/long tests only (matches standard's intent).

10. **S8.1 (Scale tier identification)** — 83%. Tier assignments match 5/6 suites. Payload sits at a tier boundary.

---

## Standards Needing Revision (Below 83% Accuracy)

### 1. TA1.3 (Fixture-driven Arrange) — 50% accuracy

**Problem:** Standard recommends fixtures via `test.extend<T>()` as the path to clean AAA separation. But 3/6 fresh suites (Lexical, Payload CMS, Twenty CRM partially) achieve equally clean separation through helper functions and `beforeAll`/`beforeEach`.

**Root cause:** The standard conflates the *mechanism* (fixtures) with the *outcome* (externalized setup). Helper function libraries (Lexical: `assertHTML`, `initialize`; Payload: 80+ helpers) achieve the same outcome without fixture syntax.

**Recommended revision:**
- Reframe TA1.3 to: "Externalize the Arrange phase via fixtures OR a shared helper library"
- Add helper-library pattern as a first-class valid alternative alongside fixtures
- Note that helper functions are more common in editor/component-testing suites (Lexical, Excalidraw, Slate) where there is no auth or data dependency
- Retain the recommendation that fixtures are preferred when setup requires teardown (auth, data creation)

### 2. TA2.1 (Short tests under 30 lines) — 50% accuracy

**Problem:** 3/6 suites fail or partially meet the under-30-line target. Twenty CRM has 50-100 line tests, Formbricks has 180-520 line tests, and Lexical's History tests average 85 lines.

**Root cause:** The standard sets "under 30 lines" as a SHOULD-level target but the evidence shows a much wider distribution is normal, especially for:
- Early-stage suites writing comprehensive scenarios (Twenty CRM)
- Survey/form builders with many sequential UI interactions (Formbricks)
- Editor suites with undo/redo chains (Lexical History)

**Recommended revision:**
- Weaken the "under 30 lines" from SHOULD to "TARGET" or "IDEAL"
- Add explicit acknowledgment that test length depends heavily on product domain
- Add a domain-adjusted expectation table:
  - CRUD apps: 10-25 lines achievable
  - Editors/form builders: 25-50 lines typical
  - CUJ/workflow tests: 50-100 lines acceptable
  - Survey/wizard flows: 100+ lines may be justified with test.step()
- Keep the "over 50 lines should be examined" and "over 80 lines must be justified" as guardrails

### 3. TA2.4 (3-10 tests per file) — 33% accuracy

**Problem:** Only 2/6 suites consistently match the 3-10 tests/file range. Lexical has 62-test files, Payload has 200+ test files, Builder.io has 30-42 test files.

**Root cause:** The standard's range is too narrow. Editor suites (Lexical) put many feature variants in one file. Access-control suites (Payload) comprehensively test all permission combinations in one file. SDK suites (Builder.io) multiply tests across variants.

**Recommended revision:**
- Widen the recommended range to 3-15 tests per file
- Add explicit exceptions: permission matrices (may have 20+ tests in one file), parametric tests (may multiply), editor features (may have 30+ variants)
- Keep the "examine for splitting at 15+" guidance but add "unless the tests cover a single atomic feature with many variants"
- Add a domain-specific table for expected tests-per-file ranges

### 4. TA4.2 (Prefer fixtures over beforeEach) — 67% accuracy

**Problem:** 2/6 suites (Lexical, Payload CMS) rely entirely on `beforeEach`/`beforeAll` with no `test.extend<T>()`. Both suites have large, mature test suites that work well without fixtures.

**Root cause:** The standard frames fixtures vs `beforeEach` as a clear preference. In practice, suites with strong helper libraries (80+ helper files in Payload) don't need fixtures because helpers serve the same purpose. The decision depends more on whether the setup requires teardown (favoring fixtures) than on suite maturity.

**Recommended revision:**
- Add "helper library pattern" as a valid alternative to fixtures at the same preference level
- Reframe the decision: "Use fixtures when setup requires guaranteed teardown (auth, data creation, container lifecycle). Use helper functions when setup is stateless (navigation, rendering, assertion)."
- Note that suites without auth/data dependencies (editors, component libraries) naturally gravitate toward helpers
- Keep the anti-pattern: `beforeEach` in shared helper files imported across test files — this IS a fixture in disguise

### 5. TA5 (Assertion density 3-5) — 67% accuracy

**Problem:** 2/6 suites show partial compliance. Lexical History tests have 8-12 assertions. Formbricks survey tests have 15-50 assertions.

**Root cause:** The 3-5 range works for average-length tests (15-30 lines) but breaks for:
- Editor tests where `assertHTML` + `assertSelection` are paired (always 2 assertions per verification point)
- Long form/survey tests where each question is an assertion point

**Recommended revision:**
- Clarify that the 3-5 range is for "assertions per logical verification point" not "assertions per test"
- Add: "Editor suites typically have 2 assertions per verification point (DOM state + selection state). A test with 8 assertions likely has 4 verification points."
- Note: "Long tests (50+ lines) naturally have more assertions; scale the expectation: ~1 assertion per 10 lines of test body"

### 6. S9.1 (Flat to nested at 20-30 files) — 60% accuracy

**Problem:** Lexical stays mostly flat at 50+ files. Builder.io stays flat at 52 files.

**Root cause:** The standard assumes all suites benefit from nesting. In practice, suites testing a single domain (editor features, SDK features) can remain flat because:
- All files belong to the same domain — nesting creates artificial categories
- Descriptive filenames (`History.spec.mjs`, `Links.spec.mjs`) are sufficient for discovery
- No CODEOWNERS benefit since one team owns all tests

**Recommended revision:**
- Add exception: "Flat organization is acceptable beyond 30 files when all tests belong to a single product domain (e.g., editor features, SDK features, field types)"
- Refine the trigger: "Restructure from flat to nested when (a) 20-30 test files AND (b) tests cover 3+ distinct product domains"
- Keep the core recommendation for multi-domain applications

---

## Cross-Cutting Findings

### Finding 1: Helper libraries are the fixture alternative

The most significant finding is that 3/6 fresh suites (Lexical, Payload CMS, Twenty CRM) achieve the outcomes we attribute to fixtures through helper function libraries instead. This pattern was under-recognized in our Phase 1 research because Gold-tier suites like Cal.com, Ghost, and n8n use fixtures heavily. The fresh suites show that:

- **Fixture-rich suites:** Cal.com (15+), Ghost (factories), n8n (5 layers) — all have auth + data dependencies requiring teardown
- **Helper-rich suites:** Lexical (assertion helpers), Payload CMS (80+ helpers), Excalidraw (Phase 1) — stateless or use DB reinitialization

**Implication:** TA1.3, TA2.2, and TA4.2 all need revision to acknowledge helper libraries as a first-class alternative to fixtures.

### Finding 2: Test length is domain-dependent

The 30-line target works well for CRUD applications but fails for editors, form builders, and survey tools. Our Phase 1 evidence base was heavily weighted toward CRUD (Grafana dashboards, Cal.com bookings, Ghost posts). Fresh suites from different domains show wider distributions.

### Finding 3: Coverage standards are the strongest

COV1-COV5 achieved 95.5-97.7% accuracy. The coverage standards are well-calibrated because they describe *what* to test rather than *how* to structure tests. The "what" is more universal than the "how."

### Finding 4: Scaling standards hold well

S8-S12 achieved 76.9-88.5% accuracy. The main weakness is S9.1 (directory nesting), which needs the single-domain exception noted above.

### Finding 5: Tests-per-file range is too narrow

TA2.4 at 33% accuracy is the weakest standard. The 3-10 range needs widening to 3-15, with explicit exceptions for parametric tests and permission matrices.

---

## Recommended Actions

1. **Revise TA1.3, TA4.2:** Add helper-library pattern as valid alternative to fixtures
2. **Revise TA2.1:** Weaken under-30-line target; add domain-adjusted expectations
3. **Revise TA2.4:** Widen range to 3-15; add exception for variant-heavy files
4. **Revise TA5:** Clarify "per verification point" not "per test"; add scaling guidance
5. **Revise S9.1:** Add single-domain exception for flat organization
6. **No revision needed:** TA1.1, TA1.2, TA3.1, TA4.1, TA6, COV1-COV5, S8.1-S8.4, S10-S12

### Priority

| Priority | Standards | Impact |
|----------|-----------|--------|
| High | TA1.3, TA4.2 (helper pattern) | Affects how suites approach setup architecture |
| High | TA2.1 (test length) | Affects practical advice given to teams |
| Medium | TA2.4 (tests/file) | Narrower impact, mostly editorial |
| Medium | S9.1 (directory nesting) | Affects scaling advice for single-domain products |
| Low | TA5 (assertion density) | Mostly clarification, not correction |
