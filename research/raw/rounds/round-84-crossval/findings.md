# Round 84 — Cross-Reference & Contradiction Audit

> **Scope:** Cross-reference TA1-TA6 (test-anatomy-standards.md), COV1-COV5 (coverage-standards.md), and S8-S12 (structure-standards.md scaling extension) against ALL existing standards (S1-S7, V1-V6, C1-C7, P1-P7, SEC1-SEC7, N1-N8, Q1-Q7).

---

## 1. Contradictions Found

### CONTRADICTION-1: TA5.3 (Guard Assertions) vs V1.2 (Guard Assertions)

**TA5.3** says: "Explicit guard assertions SHOULD only be used when the initial state is ambiguous after complex navigation or multi-step setup." Evidence: "Only 2/15 suites use explicit guard assertions as a deliberate pattern." The standard advises relying on Playwright's auto-waiting and treating guard assertions as optional.

**V1.2** says: "Insert `await expect(locator).toBeVisible()` before interacting with elements to serve as a synchronization point." Evidence: "Guard assertions are the single most effective flakiness prevention technique, observed in 18/21 suites (86%)."

**Severity: HIGH.** These two standards give directly opposing guidance. V1.2 positions guard assertions as a universal best practice (SHOULD, 86% adoption). TA5.3 positions them as an edge-case technique (only for ambiguous state, 2/15 adoption). The evidence bases also diverge: V1.2 cites 18/21 suites; TA5.3 cites 2/15 suites.

**Root cause:** Different sample pools (21 suites for V1 vs 15 suites for TA5) and possibly different definitions of "guard assertion." V1.2 treats any `toBeVisible()` before a click as a guard; TA5.3 may be counting only explicit precondition-checking assertions separate from the natural Act-Assert flow.

---

### CONTRADICTION-2: TA2.4 (Tests per File) vs S9.3 (Spec File Splitting)

**TA2.4** says: "Test files SHOULD contain 3-10 tests covering related behaviors of a single feature. Files with more than 15 tests SHOULD be examined for splitting by sub-feature."

**S9.3** says: "Individual spec files SHOULD be split when they exceed 200 lines or contain 10+ tests."

**Severity: LOW.** TA2.4 recommends examining at 15+ tests; S9.3 recommends splitting at 10+. These are not contradictory but create an inconsistent threshold. TA2.4 says 3-10 is the acceptable range and 15+ needs examination; S9.3 says 10+ should be split. The practical guidance disagrees on when to act.

---

### CONTRADICTION-3: TA3.1/TA3.2 (test.step() Restrictive) vs S5.4 (test.step() Encouraged)

**TA3.1** says: "`test.step()` SHOULD only be used in tests exceeding ~50 lines that cover multi-phase workflows or CUJs." "`test.step()` MUST NOT be used as a general-purpose test organization mechanism."

**TA3.2** says: "Prefer splitting into separate tests over using `test.step()`."

**S5.4** says: "Long tests with multiple phases SHOULD use `test.step()` for readable reporting." "Prefer fewer, longer tests with `test.step()` over many micro-tests."

**Severity: MEDIUM.** S5.4 recommends "fewer, longer tests with `test.step()`" which directly conflicts with TA3.2's "prefer splitting into separate tests over using `test.step()`." The TA standards take a more restrictive stance based on deeper analysis (15 suites, only 3 use `test.step()`). S5.4 reflects earlier analysis and a more permissive recommendation.

---

### CONTRADICTION-4: TA6.5 (Describe Nesting Max 2) vs N2.4 (Describe Nesting Max 2-3)

**TA6.5** says: "describe blocks SHOULD NOT nest deeper than 2 levels within a single file."

**N2.4** says: "Keep `test.describe` nesting to 2 levels (feature > scenario) for most suites. 3-level nesting (feature > context > scenario) is appropriate only for complex applications with role-based access patterns."

**Severity: NEGLIGIBLE.** These are compatible — N2.4 already acknowledges 3 levels as an exception for role-based patterns. TA6.5 is slightly more restrictive (max 2 always). The standards essentially agree but TA6.5 should acknowledge the N2.4 exception.

---

## 2. MUST/SHOULD/MAY Alignment Issues

### ALIGNMENT-1: TA5.6 (Web-First Assertions MUST) vs V1.1 (Web-First Assertions MUST)

**TA5.6:** "All assertions on DOM elements MUST use Playwright's web-first assertions."
**V1.1:** "All element assertions MUST use web-first (auto-retrying) assertions."

**Status:** ALIGNED. Both use MUST. No conflict.

### ALIGNMENT-2: TA4.2 (Fixtures over beforeEach SHOULD) vs S4.1 (Custom Fixtures SHOULD)

**TA4.2:** "Setup that is used across multiple test files SHOULD be implemented as fixtures."
**S4.1:** "All shared test setup SHOULD be implemented as typed fixtures."

**Status:** ALIGNED. Both use SHOULD. TA4.2 refines the scope to "cross-file" setup.

### ALIGNMENT-3: TA6.1 (Test Independence MUST) vs V6.1 (Test Isolation MUST)

**TA6.1:** "Every test MUST produce the same result whether run alone, in parallel with other tests, or in any order."
**V6.1:** Three-layer test isolation model (Browser context / Application state / Infrastructure).

**Status:** ALIGNED. TA6.1 states the principle; V6.1 provides the implementation mechanism.

### ALIGNMENT-4: COV2.1 (Tags NOT for Priority) vs N5.2 (Tags for Cross-Cutting Categorization)

**COV2.1:** "Test tiers MUST be implemented through directory structure and Playwright project definitions, not through priority tags." Tags are "valid ONLY when tests need to be excluded from specific execution contexts."

**N5.2:** Recommends `@smoke`, `@regression`, `@critical`, `@slow` tags.

**Severity: MEDIUM.** COV2.1 says 0/15 suites use priority tags and calls `@smoke`/`@regression` an anti-pattern. N5.2 recommends `@smoke`, `@regression`, `@critical` as tag conventions. The evidence from COV research (13/15 suites use zero tags) challenges the N5.2 recommendation.

---

## 3. Cross-References That Should Exist

### TA standards -> Existing standards

| New Standard | Should Reference | Rationale |
|---|---|---|
| TA1.3 (Fixture-driven Arrange) | S4.1, S4.2 (Fixture patterns) | Fixture-driven Arrange IS the S4 fixture pattern applied to test structure |
| TA2.2 (Invest in Fixtures for Short Tests) | S4.1 (Custom Fixtures), S11.1 (Fixture Scaling) | Fixture investment correlation is documented in both |
| TA3.1 (test.step() for CUJs) | N2.3 (Descriptive test.step labels) | Both cover test.step() usage but from different angles |
| TA3.3 (Descriptive Step Names) | N2.3 (Descriptive test.step labels) | Near-duplicate guidance, should cross-reference |
| TA4.1 (Setup Placement Tiers) | S4.1-S4.4 (Fixture standards) | Tier 5 = S4 fixture patterns; Tier 4 = beforeAll API; Tier 3 = globalSetup |
| TA4.2 (Fixtures over beforeEach) | S4.1 (test.extend), V6.1-V6.4 (Test Isolation) | Same recommendation from different perspectives |
| TA4.3 (beforeAll for Shared Read-Only) | V6.3 (Database Seeding) | Both discuss shared resource creation strategies |
| TA4.4 (Cleanup Matches Setup) | S6.3 (Test Data Cleanup via Fixture Teardown) | Near-identical guidance on cleanup patterns |
| TA5.1 (2-8 Assertions per Test) | V1.4 (Soft Assertions) | Assertion count guidance should reference soft assertions for high-count CUJs |
| TA5.3 (Guard Assertions) | V1.2 (Guard Assertions) | **CONTRADICTION** — must reconcile |
| TA5.5 (expect.soft() for CUJ) | V1.4 (Soft Assertions) | Both cover soft assertions but with different scope guidance |
| TA5.6 (Web-First Assertions MUST) | V1.1 (Web-First Assertions) | Overlapping MUST-level guidance |
| TA6.1 (Test Independence) | V6.1 (Test Isolation Model) | TA6.1 states principle; V6.1 provides mechanism |
| TA6.2 (Avoid serial for state) | C2.4 (Parallelism Control) | serial mode discussed in both |
| TA6.3 (Data Isolation Approaches) | V6.3, V6.4, S6.4 (Data Isolation) | Overlapping data isolation guidance |
| TA6.4 (Determinism) | V5.3 (Clock API) | Clock API is a determinism technique |
| TA6.5 (Describe Nesting Max 2) | N2.4 (Describe Nesting) | Same topic, slightly different thresholds |

### COV standards -> Existing standards

| New Standard | Should Reference | Rationale |
|---|---|---|
| COV1.1 (E2E Scope) | Q2.1 (Test Coverage and Count) | Coverage scope definition aligns with quality evaluation |
| COV1.3 (Multi-Layer E2E) | P4.1 (Separate Performance Tests) | Multi-layer architecture includes performance as a potential layer |
| COV2.1 (Structural Tiering) | S5.1 (Feature-Based Grouping), S1.5 (Feature-Based Directories) | Structural tiering relies on feature-based directory organization |
| COV2.1 (Tags NOT for Priority) | N5.2 (Tag Conventions) | **TENSION** — COV2.1 contradicts N5.2 on tag usage |
| COV2.3 (Scale CI Tier Complexity) | C7.2 (Path Filters and Selective Testing), S12.4 (Tiered Execution) | CI tier strategies overlap |
| COV3.1 (CUJs as Coverage Unit) | Q5.1 (Validation Maturity Model) | CUJ concept appears in both quality criteria and coverage strategy |
| COV3.2 (Coverage Growth Order) | S8.3 (Tier Boundary Pain Points) | Growth order aligns with scaling pain points |
| COV3.4 (Growth Triggers) | S8.2 (Transition Triggers) | Both discuss test suite growth triggers and milestones |
| COV4.1 (Happy-Path to Error-Path Ratio) | V1.5 (API Response Validation) | Error-path testing includes API response validation |
| COV4.2 (Permission Enforcement Testing) | SEC3.3 (Broken Access Control), SEC1.5 (API Auth Boundaries) | Permission enforcement covered in both security and coverage |
| COV4.3 (API-Level Error Tests) | V1.5 (Two-Layer API Assertions) | API error testing patterns overlap |
| COV5.1 (No Code Coverage for E2E) | Q2.1 (Test Coverage Dimension) | Tension: Q2.1 measures "breadth of features tested" which aligns with COV5.2 structural completeness |
| COV5.2 (Structural Completeness) | S5.1 (Feature-Based Grouping), S9.1 (Flat to Nested Directories) | Structural completeness depends on feature-based directory organization |
| COV5.5 (Coverage Maturity Model) | Q5.1 (Validation Maturity Model), Q6.1 (Seven-Domain Scoring) | Both define maturity levels; should cross-reference |

### S8-S12 standards -> Existing standards

| New Standard | Should Reference | Rationale |
|---|---|---|
| S8.1 (Scale Tiers) | S1-S6 (All existing structure) | Scale tiers extend S1-S6 guidance to different suite sizes |
| S8.2 (Transition Triggers) | Q3.1-Q3.3 (Capability Maturity) | Capability maturity overlaps with scaling maturity |
| S8.3 (Pain Points) | V4 (Flakiness Management) | Flaky test accumulation is a key pain point at each tier |
| S9.1 (Flat to Nested Directories) | S1.5 (Feature-Based Directories) | S9.1 extends S1.5 with specific thresholds |
| S9.3 (Spec File Splitting) | TA2.4 (Tests per File) | **INCONSISTENT THRESHOLDS** — 10 vs 15 |
| S9.4 (Directory Names Match Projects) | N6.3 (Descriptive Project Names) | Project naming conventions apply to scaled configs |
| S9.6 (Monorepo Configs) | C6.3 (webServer Config) | Monorepo configs affect webServer patterns |
| S10.1 (Config-Level Orchestration) | S2.3 (Multiple Playwright Projects) | S10.1 extends S2.3 to 30+ projects |
| S10.2 (CI-Level Orchestration) | C2 (Sharding), C7 (Cost Optimization) | CI orchestration encompasses sharding and cost |
| S11.1 (Fixture Scaling) | S4.1-S4.3 (Fixture Standards), TA2.2 (Fixture Investment) | Fixture scaling extends the existing fixture standards |
| S11.2 (Fixture Segmentation) | S4.3 (mergeTests) | Fixture segmentation uses mergeTests composition |
| S11.5 (Circular Dependency Prevention) | S4.3 (mergeTests/mergeExpects) | Composition patterns need dependency direction rules |
| S12.1 (Execution Stages) | C2.1 (Sharding), C2.3 (Dynamic Shard Calculation) | Execution stages include sharding as Stage 3 |
| S12.2 (Begin Sharding at 100 Tests) | C2.1 (Shard Count by Suite Size) | **DIFFERENT THRESHOLDS** — S12.2 says 100 tests; C2.1 says <50 = no sharding, 50-200 = 2-4 shards |
| S12.3 (Serial Execution Anti-Pattern) | V6.4 (Parallel Data Safety) | Serial execution root cause is data isolation failure |
| S12.4 (Tiered Execution) | C7.2 (Two-Tier PR Gate) | Both describe tiered CI strategies |
| S12.5 (Selective Execution at 500+) | C7.2 (Path Filters), COV2.3 (Scale CI Tier Complexity) | Selective execution discussed in all three |
| S12.6 (CODEOWNERS) | N6.3 (Descriptive Project Names) | Ownership requires naming alignment |

---

## 4. Terminology Consistency Issues

### TERM-1: "CUJ" (Critical User Journey)

- **Used in:** TA3.1, COV3.1, COV3.3, COV3.4, COV5.2, S12.4, Q5.1
- **Glossary status:** NOT in glossary. The term "CUJ" and "Critical User Journey" appear across multiple new standards but are not defined in `playwright-glossary.md`.
- **Action needed:** Add "CUJ" / "Critical User Journey" to the glossary with definition, evidence (Grafana uses the term explicitly), and synonym "Money Path."

### TERM-2: "Smoke test" / "Regression test" / "Critical path"

- **Defined in:** N6.2 (standard test category terminology)
- **Used in COV2.1:** Consistent with N6.2 definitions
- **Used in COV3.1:** "Critical User Journeys" extends the "Critical path" definition — consistent
- **Status:** ALIGNED

### TERM-3: "Fixture" (Playwright vs generic)

- **Glossary entry:** Yes, in N8 Pitfall 2 (cross-framework confusion)
- **TA4 usage:** Consistent with Playwright fixture definition (dependency injection via test.extend)
- **Status:** ALIGNED

### TERM-4: "Sharding"

- **C2 uses:** `--shard=N/M` with CI matrix
- **S12.2 uses:** Same concept, extended with specific threshold (100 tests)
- **COV2.3 uses:** Referenced as part of CI tier complexity
- **Status:** ALIGNED but the sharding thresholds differ between C2.1 (<50=none, 50-200=2-4 shards) and S12.2 (begin at 100 tests or 5 min CI). The S12.2 formula `ceil(N/40)` implies ~3 shards at 100 tests, which is in range of C2.1's "50-200=2-4 shards."

### TERM-5: "Scale Tier" vs "Quality Tier"

- **S8.1** defines four scale tiers: Small, Medium, Large, Enterprise (by test count)
- **Q1.1** defines three quality tiers: Gold, Silver, Bronze (by suite quality)
- **Status:** Different concepts, different names. No confusion expected. But should be cross-referenced: Q6 scoring does not account for suite size, while S8 does not account for quality. Teams could be Gold quality at Small scale or Bronze quality at Enterprise scale.

---

## 5. Overlap / Near-Duplicate Standards

### OVERLAP-1: TA4.4 (Cleanup Matches Setup) and S6.3 (Test Data Cleanup via Fixture Teardown)

Both cover the same topic: ensuring cleanup matches setup. TA4.4 provides a broader taxonomy (6 cleanup patterns), while S6.3 focuses specifically on fixture teardown. These are complementary but should cross-reference.

### OVERLAP-2: TA6.3 (Data Isolation Approaches) and V6.3/V6.4 (Database Seeding / Parallel Data Safety)

TA6.3 provides a broader taxonomy (9 approaches) than V6.3-V6.4. V6 is focused on the validation perspective; TA6 on test anatomy. Complementary but should cross-reference.

### OVERLAP-3: COV2.3 (Scale CI Tier Complexity) and S12.4 (Tiered Execution at 200+ Tests) and C7.2 (Two-Tier PR Gate)

Three standards address tiered CI execution from different angles:
- COV2.3: Coverage perspective (match tiers to suite size)
- S12.4: Structural perspective (implement tiers via projects/directories)
- C7.2: Cost perspective (path filters and selective testing)

These are complementary perspectives but should be explicitly cross-referenced to avoid confusion.

### OVERLAP-4: COV3.4 (Growth Triggers) and S8.2 (Transition Triggers)

COV3.4 covers test suite growth triggers (new features, migrations, bug-driven regression). S8.2 covers tier transition triggers (CI duration, file count, team count). The milestone tables in COV3.4 and S8 overlap significantly. Should cross-reference.

---

## 6. Standards That Should Reference New Standards (Reverse Cross-References)

The existing standards should eventually be updated to reference the new standards:

| Existing Standard | Should Reference | Reason |
|---|---|---|
| V1.2 (Guard Assertions) | TA5.3 (Guard Assertions) | Reconcile the contradiction |
| V1.4 (Soft Assertions) | TA5.5 (expect.soft() for CUJ) | CUJ-specific guidance |
| S4.1 (Custom Fixtures) | TA2.2 (Fixture Investment -> Short Tests) | Correlation evidence |
| S5.4 (test.step()) | TA3.1-TA3.2 (Restrictive test.step() guidance) | Reconcile the contradiction |
| N5.2 (Tag Conventions) | COV2.2 (Tags for Execution Control Only) | Reconcile the tension |
| N2.4 (Describe Nesting) | TA6.5 (Max Depth 2) | Align thresholds |
| Q6.1 (Seven-Domain Rubric) | COV5.5 (Coverage Maturity Model) | Coverage maturity as an optional 8th domain |
| C2.1 (Shard Count) | S12.2 (Sharding Threshold) | Align thresholds |
| C7.2 (Two-Tier PR Gate) | COV2.3 (Scale CI Tier Complexity), S12.4 (Tiered Execution) | Unified view of tiered execution |

---

## Summary

| Category | Count |
|---|---|
| **Contradictions found** | 3 (1 HIGH, 1 MEDIUM, 1 LOW) |
| **MUST/SHOULD/MAY alignment issues** | 1 (COV2.1 vs N5.2 on tags) |
| **Cross-references needed (new -> existing)** | 42 |
| **Cross-references needed (existing -> new)** | 9 |
| **Terminology gaps** | 1 (CUJ not in glossary) |
| **Near-duplicate standards** | 4 overlapping areas |
| **Threshold inconsistencies** | 2 (tests-per-file split point; sharding start point) |
