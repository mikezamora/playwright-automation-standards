# Round 92 — Deliverables: Section Guides for Test Anatomy and Coverage Strategy

**Phase:** Deliverables
**Focus:** Create implementation guides for test-anatomy-standards.md (TA1-TA6) and coverage-standards.md (COV1-COV5)
**Date:** 2026-03-19

---

## Deliverables Produced

### 1. Test Anatomy Guide

**File:** `templates/section-guides/test-anatomy-guide.md`
**References:** TA1.1-TA1.3, TA2.1-TA2.4, TA3.1-TA3.3, TA4.1-TA4.4, TA5.1-TA5.6, TA6.1-TA6.5

**Content summary:**
- AAA pattern walkthrough with Playwright code examples for both simple and multi-step flows
- Decision framework for when to split tests vs use `test.step()` (three conditions that must all be true)
- Setup placement decision tree: five tiers from inline navigation to rich fixture composition
- Assertion ordering: navigation-state-interaction-outcome sequence
- Assertion density guidelines by test archetype (smoke: 1-2, CRUD: 3-5, CUJ: 10-20+)
- Test independence and determinism patterns (unique names, seeded randoms, feature toggle declarations)
- Common mistakes table: 10 anti-patterns with fixes and standard references

**Key decisions:**
- Presented the setup placement as a flowchart-style decision tree rather than a flat table — matches how practitioners actually decide
- Included the fixture investment correlation table (fixture depth vs avg test length) as the guide's strongest argument for fixture investment
- Covered `expect.soft()` usage specifically for CUJ tests, matching the production evidence (1/15 suites)

### 2. Coverage Strategy Guide

**File:** `templates/section-guides/coverage-guide.md`
**References:** COV1.1-COV1.3, COV2.1-COV2.3, COV3.1-COV3.4, COV4.1-COV4.4, COV5.1-COV5.5

**Content summary:**
- E2E boundary decision framework as a flowchart (user-visible -> multi-component -> lower-layer-sufficient)
- E2E scope priority table with must-have, should-have, and rarely-E2E categories with adoption rates
- Structural tiering recommendations with four-tier structure (smoke, regression, comprehensive, specialized)
- Tag guidance: valid only for cross-context execution control, not priority classification
- Growth strategy phases (foundation -> core workflows -> maturity -> specialized) with test count milestones
- Negative testing: 85:15 happy-to-error ratio target, six categories ranked by production frequency
- Coverage maturity model: Level 0 (none) through Level 4 (integrated), with recommended progression
- Structural completeness as the primary coverage heuristic (directory = feature coverage)

**Key decisions:**
- Emphasized the largest finding from coverage research: the gap between community guidance (priority tags) and production reality (0/15 suites use priority tags)
- Included the infrastructure milestone table mapping test count to required investment
- Presented code coverage measurement as explicitly optional — 13/15 suites skip it entirely

---

## Standards Coverage

| Standard | Covered in Guide | Depth |
|----------|-----------------|-------|
| TA1.1-TA1.3 (AAA pattern) | Test anatomy guide | Full — code examples for simple + multi-step |
| TA2.1-TA2.4 (Single responsibility) | Test anatomy guide | Full — decision framework + tests-per-file table |
| TA3.1-TA3.3 (test.step usage) | Test anatomy guide | Full — decision criteria + alternatives table |
| TA4.1-TA4.4 (Setup placement) | Test anatomy guide | Full — decision tree + cleanup patterns |
| TA5.1-TA5.6 (Assertion patterns) | Test anatomy guide | Full — density by archetype + ordering |
| TA6.1-TA6.5 (Independence) | Test anatomy guide | Full — determinism patterns + code examples |
| COV1.1-COV1.3 (E2E boundaries) | Coverage guide | Full — decision framework + priority table |
| COV2.1-COV2.3 (Coverage tiers) | Coverage guide | Full — structural tiering + scale guidance |
| COV3.1-COV3.4 (Growth strategy) | Coverage guide | Full — CUJ definition + growth phases |
| COV4.1-COV4.4 (Negative testing) | Coverage guide | Full — ratio target + six categories |
| COV5.1-COV5.5 (Measurement) | Coverage guide | Full — maturity model + structural completeness |

---

## Format Alignment

Both guides follow the established section guide format from `templates/section-guides/assertions-guide.md`:
- Header with standard references
- Purpose and Goals section
- Key Standards with code examples
- Decision frameworks and tables
- Common Pitfalls/Mistakes table
- When to Deviate section
