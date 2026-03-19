# Round 85 — Audit Notes

> Cross-validation audit of TA1-TA6, COV1-COV5, S8-S12 against all existing standards (S1-S7, V1-V6, C1-C7, P1-P7, SEC1-SEC7, N1-N8, Q1-Q7).

---

## Metrics

| Metric | Count |
|---|---|
| **Contradictions found** | 3 |
| **Contradictions resolved** | 3 |
| **Contradictions unresolved** | 0 |
| **Cross-references identified** | 51 (42 new->existing + 9 existing->new) |
| **Terminology corrections needed** | 1 (add CUJ to glossary) |
| **Threshold inconsistencies** | 2 (both resolved) |
| **Near-duplicate standard areas** | 4 (all documented, cross-references proposed) |
| **MUST/SHOULD/MAY alignment issues** | 1 (COV2.1 vs N5.2, documented as tension not contradiction) |

---

## Contradiction Detail

### 1. TA5.3 vs V1.2 — Guard Assertions (HIGH severity)

- **Nature:** V1.2 recommends guard assertions universally (86% adoption); TA5.3 recommends them only for ambiguous state (13% adoption)
- **Root cause:** Different definitions of "guard assertion" and different sample pools
- **Resolution:** Definitional alignment — both are correct in their scope. V1.2 covers Act-Assert interleaving (synchronization points between steps). TA5.3 covers explicit precondition checks before the primary action. Add clarifying notes to both.
- **Risk if unresolved:** Teams could interpret the standards as contradictory and lose confidence in the overall guidance.

### 2. TA3.1-3.2 vs S5.4 — test.step() Usage (MEDIUM severity)

- **Nature:** S5.4 says "prefer fewer, longer tests with test.step()"; TA3.1-3.2 say "prefer splitting into separate tests over test.step()"
- **Root cause:** S5.4 reflects earlier analysis (rounds 1-12); TA3 reflects deeper analysis (rounds 56-67) with 15 suites showing only 3/15 use test.step()
- **Resolution:** TA3 supersedes S5.4 based on stronger evidence. S5.4 to be revised.
- **Risk if unresolved:** Teams could follow S5.4 and over-use test.step(), creating monolithic tests.

### 3. TA2.4 vs S9.3 — Tests-per-file Split Threshold (LOW severity)

- **Nature:** TA2.4 says "examine at 15 tests"; S9.3 says "split at 10 tests"
- **Root cause:** Different perspectives (anatomy vs scaling) with slightly different thresholds
- **Resolution:** Align TA2.4 to S9.3's 10-test threshold (more conservative, actionable).
- **Risk if unresolved:** Minor inconsistency; unlikely to cause practical confusion.

---

## Overall Consistency Assessment

### Structural Integrity: STRONG

The new standards (TA, COV, S8-S12) extend the existing framework naturally:

- **TA standards** provide test-level anatomy guidance that complements V (validation mechanics) and S (organizational structure). The layering is: S defines where tests live and how they're organized -> TA defines how individual tests are structured -> V defines how assertions and waits work within tests.

- **COV standards** provide coverage strategy that complements Q (quality criteria) and C (CI/CD execution). The layering is: COV defines what to test -> S/TA define how to structure tests -> C defines how to run tests in CI -> Q defines how to evaluate the result.

- **S8-S12** extend S1-S7 with scaling patterns. The existing S1-S7 provide foundational patterns for any suite size; S8-S12 add size-specific guidance. There is no contradiction between them — S8-S12 explicitly state "extends S1-S7" and "zero existing standards reversed."

### Evidence Consistency: GOOD

The new standards use a consistent evidence methodology (15 suites across rounds 56-81) but this pool differs from the original evidence base (21 suites across rounds 1-55). The overlap (10 Gold suites) provides continuity; the divergence (5 new large-scale suites) provides fresh perspective.

Where evidence conflicts (guard assertions, test.step() adoption), the resolution is definitional or temporal (newer analysis supersedes older). No factual contradictions exist — only interpretive differences.

### Terminology Consistency: GOOD

All standards use consistent Playwright-specific terminology (locator, fixture, project, storageState, etc.). One significant omission: "CUJ" (Critical User Journey) is used across 7+ standard sections but is not in the glossary.

The MUST/SHOULD/MAY usage is consistent:
- MUST for universal requirements (web-first assertions, test independence, cleanup)
- SHOULD for recommended practices (fixture usage, feature directories, structural tiering)
- MAY for optional practices (composables, published packages, scenario tracking)

### Coverage of New Standards by Quality Rubric: GAP IDENTIFIED

The Q6.1 Seven-Domain Scoring System does not account for the new standards:
- **Test Anatomy (TA):** Not scored. Could be folded into the "Validation" domain or added as a sub-dimension of "Structure."
- **Coverage Strategy (COV):** Not scored. The "Performance" domain is scored but has low weight and 0/10 adoption. Coverage strategy could replace or complement it.
- **Scaling (S8-S12):** Not scored. The "Structure" domain partially covers this but does not differentiate by suite size.

This is not a contradiction but a gap — the rubric was designed before these standards existed. A future update should consider whether Q6 needs an 8th domain or whether the existing domains should expand.

---

## Recommendations

1. **Immediate (before finalizing TA/COV/S8-S12):**
   - Resolve CONTRADICTION-1 (guard assertions) by adding definitional notes to TA5.3 and V1.2
   - Resolve CONTRADICTION-3 (test.step()) by revising S5.4 to align with TA3
   - Align TA2.4 threshold with S9.3 (change 15 to 10)
   - Add CUJ to glossary

2. **Near-term (next documentation update):**
   - Add the 10 Priority 2 cross-references identified in Round 85
   - Add the reality-check note to N5.2 about tag adoption

3. **Future consideration:**
   - Evaluate whether Q6.1 should be extended with a Coverage or Anatomy domain
   - Consider consolidating the three overlapping tiered-execution discussions (COV2.3, S12.4, C7.2) into a single authoritative reference with cross-references from the others

---

## Audit Methodology

1. Read all 9 standards documents completely (S1-S12, V1-V6, C1-C7, P1-P7, SEC1-SEC7, N1-N8, Q1-Q7, TA1-TA6, COV1-COV5)
2. For each new standard (26 sub-standards in TA, 19 in COV, 26 in S8-S12 = 71 sub-standards total), checked:
   - Does the recommendation contradict any existing standard?
   - Does the MUST/SHOULD/MAY level align?
   - Are there overlapping or near-duplicate standards?
   - Are cross-references present where topics overlap?
   - Is terminology consistent with the glossary?
3. Documented all findings in Round 84 findings.md
4. Proposed resolutions in Round 85 findings.md
5. Summarized metrics in this audit-notes.md
