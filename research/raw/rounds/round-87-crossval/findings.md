# Round 87 — Findings: Specific Revisions Needed to Existing Standards

**Phase:** Cross-validation
**Focus:** Identify specific changes needed in existing standards (S1-S6, V1-V6, C1-C7, P1-P7, SEC1-SEC7, N1-N8, Q1-Q7) based on Phase 2 evidence from rounds 56-81

---

## Executive Summary

Phase 2 evidence necessitates revisions to 3 existing standards (S5.2, S5.3, S5.4) and clarifying updates to 2 others (V1.4, C2.4). Additionally, 3 cross-references must be added to connect Phase 1 standards to new Phase 2 standards. No existing standard requires reversal.

---

## Revision 1: S5.4 — Downgrade `test.step()` from SHOULD to MAY

### Current Text
> Long tests with multiple phases SHOULD use `test.step()` for readable reporting

### Problem
Phase 2 found that 12/15 production suites do not use `test.step()` (TA4.2). The current SHOULD recommendation implies this is an expected practice in mature suites, but the evidence shows the opposite — mature suites achieve readable tests through fixture investment and shorter test bodies, not through `test.step()` instrumentation.

### Proposed Revision
> Long tests with multiple phases MAY use `test.step()` for readable reporting. However, production adoption is low: 12/15 analyzed suites do not use `test.step()`. The preferred approach is to reduce test length through fixture investment (see TA1.3, TA3) and accept interleaved act-assert as the structural norm (see TA1.2).

### Evidence
- TA4.2: `test.step()` adoption analysis (3/15 suites: n8n, Ghost, Element Web)
- TA1.3: Fixture-driven Arrange correlation with test length
- Structural-patterns.md: Maturity spectrum shows fixture investment, not step instrumentation, as the progression path

---

## Revision 2: S5.2 — Add Reality Check for Priority Tags

### Current Text
> Use `@tag` annotations for categorization that cuts across feature directories
> Common tag categories: Priority: `@critical`, `@smoke`, `@regression`

### Problem
Phase 2 found that 0/15 production suites use tag-based priority classification. Structural tiering (dedicated projects, directories, CI triggers) dominates. S12.4 already documents this with explicit evidence, but S5.2 still recommends priority tags as if they are standard practice.

### Proposed Revision
Add a reality-check paragraph after the tag categories list:

> **Reality check:** Priority tags (`@critical`, `@smoke`, `@regression`) appear in documentation and community guides but are not used in any of the 15 analyzed production suites. Production suites achieve execution tiering through structural mechanisms:
> - **Project-based:** Dedicated `smoke` project in config (Grafana)
> - **Directory-based:** `smoke/` directory maps to smoke project (Grafana)
> - **CI-trigger-based:** Different workflows for PR vs merge events (Element Web)
>
> Tag-based priority classification is a valid alternative but requires enforcement discipline to prevent tag rot. See S12.4 for the full tiered execution framework.

Also move "Priority" out of the "Common tag categories" list and replace with observed categories:
- Quarantine: `@fixme`, `@skip`, `@quarantined` (V4.2)
- Feature: `@feature-x`, `@feature-flag-name`
- Platform: `@mobile`, `@desktop`
- Speed: `@slow` (Playwright built-in via `test.slow()`)

### Evidence
- S12.4: 0/15 production suites use tag-based smoke selection
- Round 47: Fresh suite validation found no priority tag usage in 7 additional suites
- Validation-patterns.md round 28: Two-tier PR gate uses structural tiers, not tags

---

## Revision 3: S5.3 — Add Caveat on `test.describe.serial()`

### Current Text
> Use `test.describe()` for: shared setup/teardown via `beforeEach`, logical grouping of related scenarios, serial execution when needed (`test.describe.serial()`)

### Problem
The mention of `test.describe.serial()` as a routine use case is inconsistent with TA6.2 and S12.3, which document serial execution as an anti-pattern for state sharing (1/15 suites). The current text presents serial execution as co-equal with other `test.describe()` use cases.

### Proposed Revision
> Use `test.describe()` for: shared setup/teardown via `beforeEach`, logical grouping of related scenarios
> Serial execution via `test.describe.serial()` is a last resort — only 1/15 analyzed production suites uses it. Prefer per-test isolation and parallel execution. See TA6.2 for details.

### Evidence
- TA6.2: Only Rocket.Chat uses `test.describe.serial()` for state sharing
- S12.3: Serial execution at 50+ tests is an anti-pattern
- Structural-patterns.md confirmed theme 6 initially stated "serial execution is a valid strategy" for freeCodeCamp — but Phase 2 revealed this was a limitation (workers: 1), not a deliberate choice

---

## Revision 4: V1.4 — Add Cross-Reference to TA2 (Assertion Count)

### Current Text
> Default to hard assertions with focused test scope. One behavior per test with 2-5 supporting assertions.

### Assessment
This text is **compatible** with Phase 2 findings but incomplete. TA2 provides a much more detailed assertion count analysis:
- Gold suites: median 4 assertions per test (IQR 2-7)
- Tests under 15 lines: 1-3 assertions
- Tests 15-40 lines: 3-6 assertions
- Tests over 40 lines: 5-12+ assertions

### Proposed Addition
Append after "2-5 supporting assertions":
> See TA2.1 for detailed assertion-count analysis by test length. The 2-5 range applies to typical medium-length tests; longer workflow tests may have 7-12 assertions across interleaved act-assert pairs (see TA1.2).

### Evidence
- TA2.1: Assertion count distribution across 15 suites
- TA1.2: Interleaved Act-Assert as norm for multi-step flows

---

## Revision 5: C2.4 (Sharding) — Add Cross-Reference to S8/S12 Scaling Tiers

### Current Text
The cicd-standards.md sharding section documents shard calculation and matrix strategy but does not reference the scaling tier framework that determines when sharding becomes necessary.

### Proposed Addition
Add to C2.1 or C2.4:
> Sharding necessity correlates with suite scale tier (see S8.1). Small suites (1-50 tests) do not benefit from sharding. Medium suites (50-200) benefit from 2-4 shards. Large suites (200-1000) require 4-8 shards. Enterprise suites (1000+) require dynamic shard calculation with timing-based distribution (S12.5).

### Evidence
- S8.1: Four scale tiers
- S12.1-S12.5: CI scaling standards
- Round 10 Finding 7: "Below 100 tests, sharding adds more overhead than benefit"

---

## New Cross-References Required

| From | To | Reference |
|---|---|---|
| S5.4 | TA1.3, TA3, TA4.2 | `test.step()` recommendation now qualified by anatomy evidence |
| S5.2 | S12.4 | Priority tags now qualified by structural tiering evidence |
| S5.3 | TA6.2, S12.3 | Serial execution now qualified as anti-pattern |
| V1.4 | TA2.1, TA1.2 | Assertion count now expanded with anatomy analysis |
| C2.1 | S8.1, S12.1 | Sharding now linked to scaling tier framework |
| S1.5 | S9.1, S9.2 | Feature-based grouping now linked to scaling directory standards |
| Q6 | TA1-TA6, COV1-COV5 | Unified quality rubric should incorporate anatomy and coverage dimensions |

---

## Standards That Do NOT Need Revision

| Standard | Phase 2 Finding | Assessment |
|---|---|---|
| V1.1 (Web-first assertions) | No anatomy impact | Unchanged — universal pattern |
| V1.2 (Guard assertions) | Supports TA1.2 interleaved pattern | **Strengthened** — guard assertions are the mechanism for safe interleaved act-assert |
| V2 (Retry and timeout) | No anatomy impact | Unchanged |
| V3 (Wait strategies) | No anatomy impact | Unchanged |
| V4 (Flakiness management) | No anatomy impact | Unchanged |
| V5 (Network determinism) | No anatomy impact | Unchanged |
| V6 (Test isolation) | Supports TA6.1 | **Strengthened** — isolation is the prerequisite for parallel execution |
| S1-S4 (Structure basics) | No anatomy impact | Unchanged |
| S6 (Data management) | Supports TA1.3 fixture-driven arrange | **Strengthened** — data fixtures are part of the Arrange phase |
| C1-C7 (CI/CD) | Minor cross-ref addition only | Unchanged except C2 cross-reference |
| P1-P7 (Performance) | No anatomy/coverage impact | Unchanged |
| SEC1-SEC7 (Security) | No anatomy impact | Unchanged |
| N1-N8 (Semantic) | N5.2 tag conventions align with S5.2 revision | Follow S5.2 revision for consistency |
