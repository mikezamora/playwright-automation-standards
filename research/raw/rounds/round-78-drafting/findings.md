# Round 78 Findings — Draft Coverage Standards COV1-COV3

## Phase
Standards Drafting (Phase 3)

## Objective
Draft COV1 (E2E Testing Boundaries), COV2 (Coverage Tiers), and COV3 (Prioritization & Growth Strategy) based on evidence from rounds 56-71.

---

## Standards Drafted

### COV1: E2E Testing Boundaries (3 sub-standards)

**COV1.1 — Define E2E scope by user-facing workflows and system integration points**
- Decision criteria framework: test at E2E when behavior is user-visible, spans multiple components, and cannot be verified at lower layers
- Backed by 15/15 suites testing user-facing workflows; 0/15 testing business logic at E2E

**COV1.2 — Follow the priority table for E2E coverage scope**
- Three-tier priority table (Must-have, Should-have, Rarely-at-E2E) with evidence counts per category
- Must-have: auth (13/15), CRUD (15/15), navigation (15/15), forms (14/15)
- Rarely-at-E2E: computation (0/15), component rendering (0/15), API contracts (0/15)

**COV1.3 — Use multi-layer E2E architecture when product complexity warrants it**
- Documented 5 suites with multi-layer E2E (Ghost 5 layers, Immich 3, n8n 6, Next.js 4, Grafana 5)
- Key pattern: "API layer for breadth, UI layer for depth"
- Adoption threshold: > 100 spec files or distinct API + UI surfaces

### COV2: Coverage Tiers (3 sub-standards)

**COV2.1 — Use structural tiering as the primary organization**
- Four-tier structure (Smoke, Regression, Comprehensive, Specialized) with time budgets
- Evidence: 11/15 suites use structural only; 0/15 use priority tags
- Grafana and Ghost reference implementations documented

**COV2.2 — Reserve tags for cross-context execution control**
- Four valid tag purposes: CI tier control, browser exclusion, fixture modification, suite identification
- When-to/when-not-to decision guidance
- Largest research finding: community recommends tags, 0/15 production suites use priority tags

**COV2.3 — Scale CI tier complexity to suite size**
- Four size tiers with strategies: <50 (none), 50-200 (change detection), 200-500 (structural + sharding), 500+ (full tiered)
- Four CI mechanisms ranked by adoption
- Element Web two-tier CI model documented as reference

### COV3: Prioritization & Growth Strategy (4 sub-standards)

**COV3.1 — Define Critical User Journeys as the primary coverage unit**
- CUJ identification process: list 5-10 critical workflows, prioritize by Risk = Impact x Likelihood
- 5 suite CUJ examples with implementation details
- Explicit vs implicit CUJ distinction (2/15 vs 13/15)

**COV3.2 — Prioritize coverage growth in consistent order**
- Four-phase growth order: Foundation (auth, CRUD, nav) -> Core (search, settings, permissions) -> Maturity (import/export, edge cases, a11y) -> Specialized (perf, realtime, crypto, chaos)

**COV3.3 — Select a breadth-vs-depth strategy**
- Three strategies (broad-shallow, narrow-deep, balanced) with suite exemplars
- Risk-based depth allocation guidance

**COV3.4 — Plan for common growth triggers**
- Five growth triggers with rate estimates
- Six suite size milestones with infrastructure requirements

---

## Evidence Sources

- Coverage synthesis: `research/synthesis/coverage-patterns.md`
- Round 68: E2E boundary analysis (7 suites deep-dived)
- Round 69: Tier patterns (structural vs tags, CI differentiation)
- Round 70: Growth patterns and negative testing
- Round 71: Coverage measurement approaches
- Round 63: Audit notes (evidence assessment for all COV standards)
- Rounds 56-62: Landscape analysis of 15 suites

## Cross-References

- COV1.2 priority table aligns with S1.5 (feature-based directory organization)
- COV2.1 structural tiering reinforces S1.5 and S2.3 (Playwright projects)
- COV2.3 CI tier sizing aligns with C1 (pipeline configuration) from cicd-standards.md
- COV3.2 growth order aligns with SEC1 (auth testing) from security-standards.md
