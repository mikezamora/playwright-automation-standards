# Round 90 — Finalization: Consolidated Contradiction Resolution

**Phase:** Finalization
**Focus:** Read all audit notes from rounds 83, 85, 87, 89; consolidate resolutions; produce final change list
**Date:** 2026-03-19

---

## Audit Notes Review

### Round 83 Audit Notes — Phase 2 Validation Checkpoint
- Overall accuracy: 90.5% (below 93% target)
- Three standards below 85%: TA4.2 (fixture gap), TA2.2 (fixture investment), COV1.3 (multi-layer E2E)
- No contradictions between Phase 2 standards and fresh suite evidence
- Logto's @smoke usage noted as exception, not contradiction

### Round 85 Audit Notes — Cross-Standard Contradiction Resolutions
- 3 contradictions found (1 HIGH, 1 MEDIUM, 1 LOW)
- 1 additional MUST/SHOULD alignment issue (COV2.1 vs N5.2)
- 42 cross-references needed
- Proposed resolutions for all contradictions

### Round 87 Audit Notes — Phase 1 vs Phase 2 Reconciliation
- 8 early signals formalized into new Phase 2 standards
- 2 high-priority existing standards need revision (S5.4, S5.2)
- 1 medium-priority qualification needed (S5.3 serial mention)
- Zero Phase 1 findings contradicted by Phase 2 evidence

### Round 89 Audit Notes — Cumulative Accuracy
- Post-adjustment overall accuracy: ~94% (exceeds 93% target)
- 6 contradictions all resolved in proposals
- 7 standards requiring update identified
- 6 strongest consensus standards confirmed

---

## Consolidated Contradiction Resolution Table

| ID | Standards | Severity | Resolution | Confidence |
|----|----------|----------|------------|------------|
| C-1 | TA5.3 vs V1.2 | HIGH | Harmonize with 4-level guard assertion spectrum. V1.2 adds note: interleaved Act-Assert provides implicit guards. TA5.3 clarifies it addresses Level 2-3 explicit guards only. Both statistics remain valid (18/21 for any guard, 2/15 for explicit-only). | Very High |
| C-2 | TA2.4 vs S9.3 | LOW | Align thresholds: 3-10 target range, 15+ triggers examination. S9.3 changes "10+" to "15+" to match TA2.4. | High |
| C-3 | S5.4 vs TA3 | MEDIUM | Update S5.4: change "prefer fewer, longer tests with `test.step()`" to "reserve `test.step()` for CUJ and long workflow tests >50 lines." PostHog approach becomes "valid alternative." Cross-reference TA3. | Very High |
| C-4 | S5.2 vs COV2.2 | MEDIUM | Update S5.2: remove priority tags from "common categories"; replace with execution-context tags (browser exclusion, CI tier control). Cross-reference COV2.2. | Very High |
| C-5 | S12.2 vs C2.1 | LOW | Add cross-references between S12.2 and C2.1. Note that 50-100 tests is the typical sharding start range, triggered by CI duration >5 minutes. | High |
| C-6 | COV2.1 vs N5.2 | MEDIUM | Update N5.2: align with COV2.2 framework. Remove priority tags from recommended conventions. | Very High |

---

## S5.2 Tag Resolution — CRITICAL

### Current S5.2 Text (problematic):
> "Use tags for cross-cutting test categorization. Common tag categories: Priority: `@critical`, `@smoke`, `@regression`; Speed: `@slow`, `@fast`; Feature flags: `@feature-x`; Platform: `@mobile`, `@desktop`."

### Evidence Against Current Text:
- 0/15 deep-dive suites use priority tags as primary organization
- 1/21 suites (Logto) uses @smoke as secondary convenience
- 13/15 deep-dive suites use zero tags of any kind
- Community guides universally recommend tags; production suites universally don't use them
- Guidance-practice gap is the largest finding of coverage research

### Resolved S5.2 Text:
> "Use tags for execution context control, not priority classification."
> - Tags SHOULD be used for cross-cutting execution control that cannot be achieved through directory structure or Playwright projects alone
> - Tags SHOULD NOT be used as the primary tier or priority mechanism
> - **Valid tag purposes:** CI tier control (`@mergequeue`), browser exclusion (`@no-firefox`), fixture modification (`@auth:none`), suite identification (`@dashboards`)
> - **Evidence:** 13/15 suites use zero tags; 2/15 use tags for execution context; 0/15 use priority tags
> - **Valid alternative:** `@smoke` as secondary convenience on top of structural tiering
> - **Anti-pattern:** `@smoke`/`@regression` tags as primary test categorization
> - See COV2.2 for detailed guidance

---

## S5.4 test.step() Resolution — CRITICAL

### Current S5.4 Text (problematic):
> "Long tests with multiple phases SHOULD use `test.step()` for readable reporting. Pattern: Prefer fewer, longer tests with `test.step()` over many micro-tests."

### Evidence Against Current Text:
- 12/15 suites use zero `test.step()` calls
- 3/15 suites limit `test.step()` to <20% of files
- Production consensus: write short tests, not long tests with steps
- PostHog is the only suite explicitly recommending "fewer, longer tests with steps"

### Resolved S5.4 Text:
> "Reserve `test.step()` for CUJ and long workflow tests"
> - `test.step()` SHOULD only be used in tests exceeding ~50 lines covering CUJs or multi-phase workflows
> - Prefer splitting into separate tests over using `test.step()` — 12/15 production suites achieve complex test organization without steps
> - Steps appear in trace viewer and HTML report, improving debugging for long tests where splitting is impractical
> - **Evidence:** 3/15 suites use `test.step()`: Grafana (CUJ tests), Cal.com (booking flows), Rocket.Chat (token tests); all limit usage to <20% of files
> - **Valid alternative:** PostHog-style "fewer, longer tests with `test.step()`" — acceptable when test isolation costs are high
> - **Anti-pattern:** Using `test.step()` in tests under 30 lines
> - See TA3 for detailed guidance

---

## V1.2 Guard Assertion Harmonization — HIGH

### Current V1.2 Text:
> "Insert `await expect(locator).toBeVisible()` before interacting with elements to serve as a synchronization point."

### Harmonization Addition to V1.2:
> **Note:** In short focused tests following the interleaved Act-Assert pattern (TA1.2), each intermediate assertion implicitly provides guard behavior — the assertion after one action serves as synchronization before the next. Explicit guard assertions (dedicated `toBeVisible()` checks before interactions) add the most value in CUJ tests and after complex async operations where multiple UI panels load independently. See TA5.3 for refined guidance based on 15-suite deep analysis.

### Harmonization Addition to TA5.3:
> **Note:** V1.2 recommends guard assertions as a flakiness prevention technique (18/21 suites use some form of pre-interaction assertion). TA5.3 refines this: the interleaved Act-Assert pattern naturally provides implicit guards (Level 1); explicit precondition assertions (Level 2-3) are needed only for ambiguous async state transitions. Both V1.2 and TA5.3 are correct — they address different levels of guard behavior.

---

## Additional Standards Changes Required

### S5.3 Serial Execution Caveat (Medium Priority)
Add to S5.3's `test.describe()` guidance:
> **Caution:** `test.describe.serial()` SHOULD be a last resort, not a routine organization tool. Only 1/15 production suites uses serial for state sharing (Rocket.Chat), and Playwright's documentation explicitly discourages it. See TA6.2 for detailed guidance on avoiding serial execution.

### N5.2 Tag Convention Update (Medium Priority)
Align with COV2.2. Remove `@smoke`, `@critical`, `@regression` from recommended tag conventions. Replace with execution-context tags.

### Glossary Addition (Low Priority)
Add entry:
> **CUJ (Critical User Journey):** A multi-step end-to-end test that validates a complete user flow from entry to completion. CUJs represent the workflows that, if broken, would directly impact revenue or core product value. Also called "Money Paths." Example: Grafana's `dashboard-cujs/` directory contains 8 specs covering the complete dashboard creation and viewing journey. See COV3.1.

---

## Final Change Inventory

| Priority | Standard | Change Type | Description |
|----------|----------|-------------|-------------|
| Critical | S5.2 | Revision | Replace priority tags with execution-context tags |
| Critical | S5.4 | Revision | Reserve test.step() for CUJ; remove "fewer, longer tests" |
| High | V1.2 | Addition | Harmonization note for TA5.3 guard levels |
| High | TA5.3 | Addition | Cross-reference to V1.2 guard assertion context |
| Medium | S5.3 | Addition | Serial execution caveat |
| Medium | N5.2 | Revision | Align tag conventions with COV2.2 |
| Low | S9.3 | Threshold | Change 10+ to 15+ for file-split trigger |
| Low | S12.2 | Cross-ref | Reference C2.1 sharding threshold |
| Low | Glossary | Addition | Add CUJ term |

**Total: 9 changes across 8 standards + glossary**
**Reversals: 0 (all changes are refinements, additions, or harmonizations)**
