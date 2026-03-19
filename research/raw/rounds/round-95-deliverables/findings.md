# Round 95 — Deliverables Update: Glossary

> Phase: Deliverables | Date: 2026-03-19

## Objective

Extend the Playwright glossary with 12 new terms introduced or formalized by Phase 2 standards (Test Anatomy, Coverage Strategy, Scaling Organization). Each term follows the existing glossary format: definition, context, example (where applicable), related terms, and evidence citations.

## Terms Added

### From Test Anatomy Standards (TA1-TA6)

1. **AAA Pattern (Arrange-Act-Assert):** Conceptual test structure framework. Evidence: 15/15 suites exhibit AAA [TA1.1]. Includes guidance on interleaved Act-Assert in multi-step flows and fixture-driven Arrange.

2. **Test Anatomy:** The structural conventions governing how individual tests are written. Encompasses AAA, single responsibility, step usage, setup placement, assertion patterns, and independence.

3. **Test Independence:** Property that every test produces the same result regardless of execution order or parallel peers. Evidence: 14/15 suites achieve complete independence [TA6.1].

4. **Guard Assertion:** Formalized from V1.2 with the four-level spectrum discovered during cross-validation: auto-wait, locator-chain, guard, multi-guard. Evidence: only 2/15 suites use explicit guards [TA5.3].

### From Coverage Strategy Standards (COV1-COV5)

5. **Coverage Tier:** Four-tier classification (smoke, regression, comprehensive, specialized) implemented through directory structure. Evidence: 11/15 suites use structural tiering [COV2.1].

6. **Critical User Journey (CUJ):** Business-critical workflow as the primary unit of E2E coverage. Evidence: 2/15 explicit, 13/15 implicit [COV3.1].

7. **Coverage Debt:** Gap between product features and E2E coverage, visible through structural completeness audits. Evidence: Grafana alerting-suite gap [COV5.2].

8. **Structural Tiering:** Universal production pattern of using directory structure for coverage organization. Evidence: 11/15 suites, 0/15 use priority tags [COV2.1].

9. **Feature Coverage:** Product feature breadth measured through structural completeness. Evidence: 13/15 suites use this heuristic [COV5.2].

10. **Execution Budget:** Time-based constraint per coverage tier or CI stage. Evidence: Element Web PR CI <15 min, merge queue <45 min [COV2.3].

### From Scaling Standards (S8-S12)

11. **Scale Tier:** Four-tier suite classification (Starter, Growing, Large, Enterprise) determining organizational patterns. Evidence: cross-suite analysis from 35 to 550+ tests [S8.1].

12. **Transition Trigger:** Measurable indicator for moving to next scale tier. Evidence: Grafana migration, Cal.com growth, n8n infrastructure-first approach [S8.2].

## Format Verification

All 12 terms follow the existing glossary format:
- Definition (1-2 sentences)
- Context (usage guidance, adoption rates)
- Example (code or directory structure where applicable)
- Related terms (cross-references to existing glossary entries)
- Evidence (standard IDs and suite citations)

Terms are placed in a new "Test Anatomy & Coverage Terms" section, positioned before the Cross-Framework Reference table, maintaining the glossary's organizational structure.

## Glossary Statistics

- Previous: 42 entries across 6 sections
- Added: 12 entries in 1 new section
- New total: 54 entries across 7 sections
