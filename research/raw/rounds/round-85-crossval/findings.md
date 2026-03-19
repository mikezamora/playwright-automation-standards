# Round 85 — Contradiction Resolutions & Cross-Reference Plan

> **Scope:** Resolve all contradictions and inconsistencies identified in Round 84. Propose specific changes to reconcile new standards (TA1-TA6, COV1-COV5, S8-S12) with existing standards.

---

## 1. Contradiction Resolutions

### RESOLUTION for CONTRADICTION-1: TA5.3 (Guard Assertions) vs V1.2 (Guard Assertions)

**Diagnosis:** The contradiction stems from different analysis scopes and different definitions of "guard assertion."

- V1.2 defines guard assertions broadly: any `toBeVisible()` before a click, even when it is part of a natural Act-Assert interleaving. V1.2's evidence (18/21 suites) counts any instance of `expect().toBeVisible()` followed by `.click()` as a guard assertion.
- TA5.3 defines guard assertions narrowly: explicit precondition-checking assertions placed BEFORE the main action specifically to verify readiness, separate from the natural assertion flow. TA5.3's evidence (2/15 suites) counts only deliberate precondition checks.

**Resolution:** Both standards are correct within their definitions. The discrepancy is definitional, not factual.

**Proposed reconciliation:**
1. **TA5.3** should add a note: "This standard uses 'guard assertion' to mean explicit precondition checks before the main action, not web-first assertions that serve as synchronization points between action steps (see V1.2)."
2. **V1.2** should add a note: "Guard assertions between action steps (Act-Assert-Act-Assert interleaving, see TA1.2) serve as synchronization points. TA5.3 provides guidance on when additional precondition-checking assertions are needed before the first action in a flow."
3. **Neither standard needs to be reversed.** V1.2 recommends interleaving assertions between actions (which TA1.2 also endorses). TA5.3 recommends against EXTRA precondition checks before each action when auto-waiting suffices.

---

### RESOLUTION for CONTRADICTION-2: TA2.4 (15+ Tests -> Examine) vs S9.3 (10+ Tests -> Split)

**Diagnosis:** TA2.4 addresses file organization from a test anatomy perspective (how many tests naturally belong together). S9.3 addresses file organization from a scaling perspective (when files become problematic for sharding and navigation).

**Resolution:** The standards serve different purposes. S9.3's 10-test threshold is the more conservative and actionable number. TA2.4's "3-10 is normal" aligns with S9.3's "split at 10+."

**Proposed reconciliation:**
1. **TA2.4** should add a cross-reference: "See also S9.3 for file splitting guidance from a scaling perspective (recommends splitting at 10+ tests or 200 lines)."
2. **S9.3** should add a cross-reference: "See also TA2.4 for tests-per-file ratios observed across production suites (3-10 is the common range)."
3. Align the language: TA2.4 should say "Files with more than 10 tests SHOULD be examined for splitting by sub-feature" (changed from 15 to 10) to match S9.3.

---

### RESOLUTION for CONTRADICTION-3: TA3.1/TA3.2 (test.step() Restrictive) vs S5.4 (test.step() Permissive)

**Diagnosis:** S5.4 was written during earlier landscape rounds (1-12) with less evidence. TA3.1-TA3.2 were written during anatomy rounds (56-67) with deeper analysis of 15 suites showing only 3/15 use test.step().

**Resolution:** TA3.1-TA3.2 supersede S5.4 based on stronger evidence. S5.4 should be updated to align.

**Proposed reconciliation:**
1. **S5.4** should be revised: Change "Prefer fewer, longer tests with `test.step()` over many micro-tests" to "Use `test.step()` for complex multi-phase workflows and CUJ tests exceeding ~50 lines. For standard tests, prefer splitting into separate focused tests (see TA3.1, TA3.2)."
2. **TA3.1** should add a cross-reference: "This standard refines S5.4 with evidence from 15 suites confirming test.step() is a CUJ-specific tool, not a general organization mechanism."

---

### RESOLUTION for ALIGNMENT-4: COV2.1 (Tags NOT for Priority) vs N5.2 (Tags for Cross-Cutting Categorization)

**Diagnosis:** N5.2 recommends `@smoke`, `@regression`, `@critical` tags following community guidance and Playwright's v1.42 tag syntax. COV2.1 finds that 0/15 production suites use priority tags. These represent a tension between community recommendation and production practice.

**Resolution:** Both are factually correct. N5.2 reflects community guidance; COV2.1 reflects production reality. The resolution is to acknowledge the gap explicitly.

**Proposed reconciliation:**
1. **N5.2** should add a reality-check note: "Production adoption of priority tags (`@smoke`, `@critical`, `@regression`) is low — 0/15 production suites analyzed in rounds 56-71 use them (see COV2.2). Production suites overwhelmingly use structural tiering (directories and projects) as their primary categorization. Tags are most effective for execution-context control (browser exclusion, CI tier differentiation) rather than priority classification."
2. **COV2.2** should add a cross-reference: "For tag conventions when tags ARE used, see N5.2."
3. Neither standard needs to be reversed. N5.2 remains valid guidance for teams that choose to use tags; COV2.2 provides evidence that most production teams do not.

---

## 2. Threshold Alignment

### THRESHOLD-1: Sharding Start Point

- **C2.1:** "<50 = no sharding, 50-200 = 2-4 shards"
- **S12.2:** "Begin sharding at 100 tests or 5 minutes CI duration"

**Analysis:** These are compatible. C2.1 says sharding CAN start at 50; S12.2 says it SHOULD start at 100. The practical guidance is:
- 50-100 tests: Optional sharding, consider if CI exceeds 5 minutes
- 100+ tests: Sharding recommended

**Proposed reconciliation:**
1. **S12.2** should add: "This refines C2.1 with a specific 100-test recommendation. C2.1's 50-200 range for 2-4 shards remains valid; 100 tests is the recommended trigger point within that range."
2. **C2.1** should add a forward reference: "See S12.2 for specific threshold guidance on when to begin sharding."

---

### THRESHOLD-2: Describe Nesting Depth

- **N2.4:** "2 levels for most suites, 3 levels for role-based access patterns"
- **TA6.5:** "SHOULD NOT nest deeper than 2 levels"

**Analysis:** Compatible — TA6.5 is SHOULD NOT (not MUST NOT), and N2.4's 3-level exception for role-based patterns is narrow.

**Proposed reconciliation:**
1. **TA6.5** should add: "See N2.4 for the exception: 3-level nesting is acceptable for role-based access patterns in complex applications."

---

## 3. Terminology Corrections Needed

### TERM-1: Add "CUJ" to Glossary

**Proposed glossary entry:**

```
### CUJ (Critical User Journey)
**Definition:** A multi-step user workflow representing a business-critical path through the application. If a CUJ breaks, it directly impacts revenue or core product value. Also known as "Money Path."
**Context:** Used as a coverage measurement unit (COV3.1) and as a justification for longer tests with test.step() structure (TA3.1). CUJs typically span multiple pages and require sequential steps.
**Example:** In Grafana, the dashboard CUJ covers: create dashboard -> add panels -> set time range -> verify data -> share dashboard. In Cal.com, the booking CUJ covers: create event type -> user selects time -> confirm booking -> receive confirmation.
**Evidence:** Grafana has a dedicated `dashboard-cujs/` directory with 8 specs. Ghost has explicit publish flow CUJs.
**Related terms:** test.step, Smoke test, Regression test
```

---

## 4. Cross-Reference Implementation Plan

### Priority 1 — Contradiction Resolution (must-fix)

| Standard | Change | Priority |
|---|---|---|
| TA5.3 | Add definitional note distinguishing from V1.2 | HIGH |
| V1.2 | Add note clarifying relationship to TA5.3 | HIGH |
| S5.4 | Revise to align with TA3.1-TA3.2 on test.step() | HIGH |
| TA2.4 | Change "15 tests" threshold to "10 tests" to match S9.3 | MEDIUM |
| N5.2 | Add reality-check note about production tag adoption | MEDIUM |

### Priority 2 — Key Cross-References (should-fix)

| Standard | Add Reference To | Type |
|---|---|---|
| TA1.3 | S4.1, S4.2 | "See also" note |
| TA4.1 | S4.1-S4.4 | Map setup tiers to fixture standards |
| TA4.4 | S6.3 | "See also" note on cleanup |
| TA6.3 | V6.3, V6.4 | "See also" note on data isolation |
| COV2.1 | S5.1, S1.5 | "Depends on" note |
| COV2.3 | C7.2, S12.4 | "See also" note |
| COV3.4 | S8.2 | "See also" note on growth triggers |
| COV5.5 | Q5.1, Q6.1 | "See also" note on maturity models |
| S12.2 | C2.1 | "Refines" note |
| S12.4 | C7.2, COV2.3 | "See also" note |

### Priority 3 — Supporting Cross-References (nice-to-have)

All other cross-references identified in Round 84 Section 3 (42 total). These improve navigation but do not address contradictions or gaps.

---

## 5. Revision History Entry Proposals

### test-anatomy-standards.md

```
| 2026-03-19 | Cross-validation rounds 84-85 | 1 contradiction resolved (TA5.3 vs V1.2 definitional alignment), 1 threshold aligned (TA2.4 10 vs 15), cross-references added to V1, S4, S6, V6, N2 |
```

### coverage-standards.md

```
| 2026-03-19 | Cross-validation rounds 84-85 | 1 tension documented (COV2.1 vs N5.2 on tags), cross-references added to S5, C7, S12, Q5, Q6, SEC3 |
```

### structure-standards.md (S8-S12)

```
| 2026-03-19 | Cross-validation rounds 84-85 | 1 threshold aligned (S12.2 vs C2.1 sharding), cross-references added to C2, C7, TA2, COV2, COV3 |
```

---

## Summary of Resolutions

| Issue | Resolution | Action Required |
|---|---|---|
| CONTRADICTION-1 (Guard assertions) | Definitional — both correct in context | Add clarifying notes to both TA5.3 and V1.2 |
| CONTRADICTION-2 (Tests-per-file split) | Align TA2.4 to S9.3's 10-test threshold | Edit TA2.4 |
| CONTRADICTION-3 (test.step() guidance) | TA3.1-3.2 supersede S5.4 | Revise S5.4 |
| ALIGNMENT-4 (Tag usage) | Acknowledge gap between community guidance and production practice | Add reality-check note to N5.2 |
| THRESHOLD-1 (Sharding start) | Compatible — add cross-references | Add notes to S12.2 and C2.1 |
| THRESHOLD-2 (Describe nesting) | Compatible — add exception acknowledgment | Add note to TA6.5 |
| TERM-1 (CUJ missing) | Add to glossary | New glossary entry |
