# Round 79 Findings — Draft Coverage Standards COV4-COV5

## Phase
Standards Drafting (Phase 3)

## Objective
Draft COV4 (Negative & Edge Case Testing) and COV5 (Coverage Measurement & Health) based on evidence from rounds 56-71.

---

## Standards Drafted

### COV4: Negative & Edge Case Testing (4 sub-standards)

**COV4.1 — Target 80-90% happy-path, 10-20% error-path at E2E**
- Cross-suite average: 85:15 happy-path to edge-case ratio
- Error coverage varies by layer: API ~30%, SDK ~30%, UI ~5-15%
- 12 suites with specific ratio data documented

**COV4.2 — Focus on six categories of negative testing**
- Ranked by prevalence: permission enforcement (8/15), empty states (6/15), input validation (5/15), conflict resolution (3/15), recovery flows (3/15), network errors (2/15)
- Priority levels assigned: MUST (permissions), SHOULD (empty states, validation), NICE TO HAVE (conflicts, recovery), SPECIALIZED (network)

**COV4.3 — Use API-level tests for systematic error coverage**
- Immich's error DTO factory and permission matrix patterns documented as best-in-class
- Code example: error DTO factory with pre-built expected shapes
- Code example: route mocking for UI error state testing
- Only 1/15 suites uses route mocking for negative testing; 12/15 skip network error testing entirely

**COV4.4 — Maintain a regression test directory**
- n8n pattern: dedicated `regression/` directory with 12 specs
- Regression test workflow: incident -> reproduce -> place -> verify -> maintain
- Supporting evidence from Gutenberg (flaky-tests-reporter) and Next.js (manifests)

### COV5: Coverage Measurement & Health (5 sub-standards)

**COV5.1 — Do NOT require code coverage percentages for E2E**
- 13/15 suites have zero formal E2E coverage measurement
- Five factors explaining the adoption gap documented
- Production adoption table with all 15 suites

**COV5.2 — Track coverage through structural completeness**
- Structural completeness as universal heuristic (13/15 suites)
- Four-step audit checklist
- Grafana directory listing as coverage map example

**COV5.3 — Feature-scenario tracking as optional enhancement**
- Feature-scenario matrix format with example data
- Tools: feature-map, Testomat.io, custom reporters
- 80% scenario coverage target (Alphabin) vs 0% actual adoption

**COV5.4 — If collecting code coverage, use weekly CI**
- Four tools compared: V8, Istanbul, Monocart, nextcov
- n8n weekly CI pattern documented
- Merged E2E + unit coverage (nextcov demo: 80% + 46% = 88%)

**COV5.5 — Coverage maturity model**
- Five levels: None -> Structural -> Scenario -> Quantitative -> Integrated
- Adoption data per level from 15 suites
- Recommended progression: start at Level 1, only advance when specific need exists
- Key finding: Level 1 is universal floor; Level 2+ is aspirational

---

## Key Findings and Decisions

### Decision 1: Honest Representation of Practice vs Aspiration
COV4 and COV5 both required careful calibration between what community guides recommend and what production suites actually do. The standards deliberately frame the production norm (85:15 error ratio, structural-only coverage tracking) as the recommendation, with aspirational practices (scenario tracking, code coverage) as optional enhancements.

### Decision 2: Error DTO Pattern as Code Example
Immich's error DTO factory was selected as the primary code example for COV4.3 because it demonstrates the most systematic approach to error testing observed in any suite. The route mocking example was included as a secondary pattern for UI-only suites.

### Decision 3: Maturity Model Framing
The five-level maturity model in COV5.5 was framed as descriptive (where the industry is) rather than prescriptive (where teams should aspire). This avoids creating false urgency to adopt tooling that no production suite has found valuable.

### Decision 4: Regression Directory as Standard
COV4.4 was added based on n8n's dedicated regression directory pattern. While only 1/15 suites has an explicit regression directory, the practice of capturing production incidents as E2E tests is implicitly present in several suites (Cal.com flaky fixes, Gutenberg stability tracking).

---

## Evidence Sources

- Round 70: Negative testing deep dive (error ratios, growth patterns, 6 negative testing categories)
- Round 71: Coverage measurement approaches (4 tools, 5 alternative approaches, maturity model)
- Round 63: Audit notes (evidence status assessment)
- Coverage synthesis: `research/synthesis/coverage-patterns.md`
- Rounds 56-62: Landscape analysis baseline data

## Cross-References

- COV4.1 error ratio aligns with V1 (assertions) from validation-standards.md
- COV4.3 API error testing aligns with V1.5 (API response validation)
- COV5.2 structural completeness aligns with S1.5 (feature-based directories) from structure-standards.md
- COV5.4 weekly CI pattern aligns with C1 (pipeline configuration) from cicd-standards.md
- COV5.5 maturity model aligns with Q3 (maturity model) from quality-criteria.md
