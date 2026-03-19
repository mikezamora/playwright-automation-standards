# Round 94 — Deliverables Update: Checklist & Quality Criteria

> Phase: Deliverables | Date: 2026-03-19

## Objective

Update the pre-creation checklist and quality criteria to incorporate Phase 2 standards: Test Anatomy (TA1-TA6, 25 sub-standards), Coverage Strategy (COV1-COV5, 19 sub-standards), and Scaling Organization (S8-S12, 26 sub-standards). Resolve 3 of 6 cross-validation contradictions affecting checklist items.

## Changes Made

### Checklist Updates

1. **Section 8 — Test Anatomy Checklist:** Added 22 yes/no items covering TA1 (AAA pattern), TA2 (single responsibility), TA3 (test step usage), TA4 (setup placement), TA5 (assertion patterns), and TA6 (test independence & determinism). Each item linked to its source standard ID.

2. **Section 9 — Coverage Strategy Checklist:** Added 19 yes/no items covering COV1 (E2E boundaries), COV2 (coverage tiers), COV3 (prioritization & growth), COV4 (negative & edge case testing), and COV5 (coverage measurement & health).

3. **Section 1 — Structure (expanded):** Added 26 scaling items for S8 (scale tiers), S9 (directory & file scaling), S10 (configuration scaling), S11 (fixture & dependency scaling), and S12 (execution strategy at scale).

4. **Contradiction resolutions applied to checklist:**
   - S5.2: Changed from "tags used for cross-cutting categorization" to "tags reserved for execution-context control" (0/15 suites use priority tags)
   - S5.4: Changed from "complex, multi-step tests use test.step()" to "test.step() reserved for CUJ tests only" (12/15 suites do not use test.step())
   - V1.2: Changed from "guard assertions placed between action steps" to 4-level spectrum (auto-wait, locator-chain, guard, multi-guard)

### Quality Criteria Updates

1. **Q6.1:** Expanded from 7-domain to 9-domain scoring system (added Anatomy and Coverage domains).
   - Anatomy (Weight: High): 0-3 scale from "no conventions" to "factory pattern, CUJ-only steps, custom matchers"
   - Coverage (Weight: Medium): 0-3 scale from "no strategy" to "CI tiers, scenario tracking, multi-layer E2E"

2. **Q6.2:** Updated tier boundaries from 21-point to 27-point max:
   - Gold: 23-27 (was 17-21)
   - Silver: 15-22 (was 11-16)
   - Bronze: 0-14 (was 0-10)

3. **Q6.3:** Updated all example suite scores with Anatomy and Coverage columns. Grafana scores 24/27, AFFiNE 22/27, Cal.com 21/27.

4. **Q6.4:** Updated creation guide to reference four high-weight domains (structure, validation, CI/CD, anatomy).

## Validation

- All 22 TA checklist items map to verified standard IDs (TA1.1-TA6.4)
- All 19 COV checklist items map to verified standard IDs (COV1.1-COV5.5)
- All 26 scaling checklist items map to verified standard IDs (S8.1-S12.6)
- Contradiction resolutions consistent with Phase 2 evidence base
- Tier boundary recalculation verified: Gold suites retain Gold status, Silver suites retain Silver status under new scoring
