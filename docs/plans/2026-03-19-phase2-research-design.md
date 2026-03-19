# Phase 2 Research Design — Test Anatomy, Coverage Strategy, Scaling Organization

> **Approved:** 2026-03-19
> **Campaign:** Rounds 56-97 (42 rounds, expandable to 48)
> **Methodology:** Layered Spiral with Shared Discovery

---

## 1. Problem Statement

The first 55 research rounds (7 phases) produced strong standards on how to write correct Playwright code — file organization, configuration, POM, fixtures, assertions, CI/CD, security, and semantics. Three significant gaps remain:

1. **Test Anatomy** — No guidance on internal test structure (AAA pattern, single responsibility, assertion density, step usage, setup placement)
2. **Coverage Strategy** — No guidance on what to test at E2E level, how to prioritize, coverage tiers, or when to stop adding tests
3. **Scaling Organization** — No guidance on how patterns evolve from 50 to 500 to 5000+ tests, transition hurdles, config/fixture/execution scaling

These gaps matter most for teams building new suites from scratch — a primary audience for this project.

---

## 2. New Deliverables

### 2.1 Test Anatomy Standards (`standards/test-anatomy-standards.md`)

New standalone document. Standard IDs: TA1-TA6.

| ID | Area | Scope |
|----|------|-------|
| **TA1** | Arrange-Act-Assert Pattern | Canonical internal structure; how Gold suites organize setup/action/verification; when to deviate |
| **TA2** | Single Responsibility | One behavior per test vs. fewer/longer tests with steps; resolving the tension with evidence |
| **TA3** | Test Step Usage | `test.step()` vs. splitting tests; step naming; step granularity; steps as documentation |
| **TA4** | Setup Placement | Inline setup vs. `beforeEach` vs. fixtures vs. factory calls; decision framework |
| **TA5** | Assertion Patterns | Assertion density per test/step; assertion ordering (guard-action-outcome); mixing hard/soft; asserting intermediate state |
| **TA6** | Test Independence & Determinism | No order dependencies; no shared mutable state; self-contained data; idempotent tests; sequential operations |

### 2.2 Coverage Strategy Standards (`standards/coverage-standards.md`)

New standalone document. Standard IDs: COV1-COV5.

| ID | Area | Scope |
|----|------|-------|
| **COV1** | E2E Testing Boundaries | Decision framework for E2E vs. unit/integration; testing pyramid applied to Playwright; evidence of what Gold suites cover and leave to lower levels |
| **COV2** | Coverage Tiers | Four tiers: Smoke (<5 min), Regression (<30 min), Comprehensive (<2 hrs), Nightly (full matrix). What belongs in each, how to assign |
| **COV3** | Prioritization & Growth Strategy | Which tests first; risk-based criteria (user impact, revenue, frequency, historical bugs); coverage growth over time |
| **COV4** | Negative & Edge Case Testing | Error states, permission denials, boundaries, empty states at E2E vs. lower levels; how Gold suites handle this |
| **COV5** | Coverage Measurement & Health | Feature coverage tracking; identifying untested critical paths; auditing; diminishing returns; maintenance cost vs. value |

### 2.3 Scaling Organization (expand `standards/structure-standards.md` with S8-S12)

Added to existing document. Standard IDs: S8-S12.

| ID | Area | Scope |
|----|------|-------|
| **S8** | Scale Tiers & Transition Triggers | Four tiers: Small (1-50), Medium (50-200), Large (200-1000), Enterprise (1000-5000+). Restructuring triggers. Transition hurdles and pain points at each boundary. |
| **S9** | Directory & File Scaling | Splitting flat→nested; splitting spec files; cross-feature tests; shared utilities organization; monorepo patterns |
| **S10** | Configuration Scaling | Single config → composition patterns; factory functions; per-domain configs; 10/20/31+ project strategies |
| **S11** | Fixture & Dependency Scaling | Module boundaries; dependency graphs; preventing circular deps; multi-team fixture governance; composition at scale |
| **S12** | Execution Strategy at Scale | Tiered execution (PR/merge/nightly/weekly); selective runs by changed files; execution budgets; shard evolution; CODEOWNERS |

**Transition Hurdles Matrix (in S8):**

| Transition | Common Hurdles |
|-----------|---------------|
| Small → Medium | First POM need, first fixture extraction, CI setup, naming conventions become critical |
| Medium → Large | Config complexity explosion, fixture dependency tangles, CI time exceeds tolerance, tiered execution needed |
| Large → Enterprise | Multi-team ownership conflicts, shared fixture governance, config splitting, execution budget management, test infra becomes its own concern |

---

## 3. Research Phases

### Phase 1: Shared Landscape (Rounds 56-63, 8 rounds)

Re-analyze all 10 Gold suites and discover 15-20 new large-scale suites, examining each through ALL three lenses (anatomy, coverage, scaling) simultaneously.

**Gold suite re-analysis targets:**
1. grafana-e2e — 31 projects, enterprise scale
2. calcom-e2e — hybrid POM + fixtures, monorepo
3. affine-e2e — multi-platform (web, desktop, mobile)
4. immich-e2e — Docker-based, API-heavy
5. freecodecamp-e2e — largest OSS learning platform
6. excalidraw-e2e — visual/a11y focus
7. slate-e2e — rich text editor, cross-browser
8. supabase-e2e — Postgres platform
9. nextjs-e2e — framework-level testing
10. grafana-plugin-e2e — published package for ecosystem

**New suite discovery targets (15-20):**
- VS Code (microsoft/vscode) — massive test suite
- Chrome DevTools — browser-scale testing
- Shopify/Stripe/commerce platforms with public E2E
- Angular, Svelte, Remix — framework Playwright integration
- n8n, Directus, Strapi, Outline — Silver suites for deeper examination
- Any suite with 500+ Playwright tests via GitHub search
- Enterprise boilerplates with scaling patterns

**Per-suite analysis captures:**
- Internal test structure (AAA presence, step usage, assertion density)
- Coverage strategy (what's tested, what's excluded, how tiers are organized)
- Scale indicators (test count, file count, fixture count, project count, CI time)
- Directory organization at current scale
- Config complexity

**Audit checkpoint at round 63:** Write initial synthesis, populate anatomy-patterns.md and coverage-patterns.md, update structural-patterns.md with scaling patterns.

### Phase 2: Dedicated Deep Dives (Rounds 64-75, 12 rounds)

**Rounds 64-67 — Test Anatomy Deep Dives (4 rounds):**
- Select 8-10 suites with the most interesting internal test patterns
- Analyze 50+ individual tests for structural patterns
- Document AAA compliance rates, step usage frequency, assertion density distributions
- Identify the "anatomy spectrum" from Gold to Bronze

**Rounds 68-71 — Coverage Strategy Deep Dives (4 rounds):**
- Analyze what Gold suites test vs. what they leave to lower levels
- Map coverage tiers in suites that use tags (@smoke, @critical, @regression)
- Study test growth history via git log (how suites added tests over time)
- Analyze negative/edge case test patterns and their E2E vs. unit placement

**Rounds 72-75 — Scaling Organization Deep Dives (4 rounds):**
- Deep analysis of 5000+ test suites (Grafana, VS Code, etc.)
- Study config composition strategies in multi-project suites
- Analyze fixture dependency graphs in large suites
- Document execution strategies (tiered runs, selective execution, CI budgets)
- Study git history for restructuring events (directory reorganizations, config splits)

**Audit checkpoint at round 75:** Draft all new standards. Audit rounds 1-55 findings against new evidence.

### Phase 3: Standards Drafting + Validation (Rounds 76-83, 8 rounds)

**Rounds 76-77 — Draft test-anatomy-standards.md (TA1-TA6)**
**Rounds 78-79 — Draft coverage-standards.md (COV1-COV5)**
**Rounds 80-81 — Draft S8-S12 in structure-standards.md**
**Rounds 82-83 — Validate all drafts against 5-10 fresh suites not yet analyzed**

Each draft follows existing format: ID, recommendation, rationale, evidence with citations, valid alternatives, anti-patterns.

**Audit checkpoint at round 83:** Validate standards predict the patterns in fresh suites.

### Phase 4: Cross-Validation + Audit (Rounds 84-91, 8 rounds)

**Rounds 84-85 — Audit new standards against existing standards (S1-S6, V1-V6, C1-C7, etc.)**
- Check for contradictions
- Ensure consistent terminology
- Verify cross-references

**Rounds 86-87 — Audit rounds 1-55 findings against new research**
- Do any earlier findings need revision in light of new evidence?
- Are there patterns in old rounds that should have been caught but weren't?

**Rounds 88-89 — Fresh suite validation**
- Find 5-8 suites not previously analyzed
- Apply ALL standards (old + new) as a rubric
- Record accuracy rate (target: 93%+ like original campaign)

**Rounds 90-91 — Resolve contradictions, finalize standards**
- Address any conflicts found in audit
- Final wording pass on all new standards
- Mark as FINAL

**Audit checkpoint at round 91:** All standards finalized, no contradictions.

### Phase 5: Deliverables + Final (Rounds 92-97, 6 rounds)

**Round 92 — Update templates**
- Add example tests demonstrating TA1-TA6 to suite template
- Add scaling comments to playwright.config.ts
- Add coverage strategy section to template README

**Round 93 — Create new section guides**
- `templates/section-guides/test-anatomy-guide.md`
- `templates/section-guides/coverage-guide.md`
- `templates/section-guides/scaling-guide.md`

**Round 94 — Update checklist**
- Add Section 8 (Test Anatomy) with TA1-TA6 items
- Add Section 9 (Coverage Strategy) with COV1-COV5 items
- Expand Section 1 (Structure) with S8-S12 items

**Round 95 — Update quality criteria and glossary**
- Add anatomy and coverage evaluation dimensions to Q2
- Expand Q6 unified rubric to 9 domains
- Recalculate tier boundaries
- Add new glossary terms

**Round 96 — Update synthesis files and sources**
- Create anatomy-patterns.md and coverage-patterns.md
- Update structural-patterns.md with scaling patterns
- Update sources.md with all new suites

**Round 97 — Final consistency pass**
- Read all deliverables end-to-end
- Verify cross-references
- Ensure glossary terms match usage in standards
- Ensure checklist items map to standard IDs
- Update CLAUDE.md and README.md

---

## 4. Per-Round Methodology

Each round follows:
1. **Research** — Web search, GitHub analysis, suite code inspection
2. **Extract** — Pull patterns related to anatomy/coverage/scaling
3. **Distill** — Identify consensus vs. outliers
4. **Validate** — Cross-reference against other suites
5. **Update** — Update synthesis files and sources bibliography

**Round artifacts:**
- `research/raw/rounds/round-NN-phase/findings.md`
- `research/raw/rounds/round-NN-phase/suites-analyzed.md`
- `research/raw/rounds/round-NN-phase/audit-notes.md` (audit rounds only)
- `research/raw/suite-analyses/[project-name].md` (deep dives — append to existing for Gold suites)

**New synthesis files:**
- `research/synthesis/anatomy-patterns.md`
- `research/synthesis/coverage-patterns.md`

**Audit checkpoints:** Rounds 63, 75, 83, 91, 97.

---

## 5. Success Criteria

- All 10 Gold suites re-analyzed through anatomy/coverage/scaling lenses
- 15-20 new suites discovered and analyzed, with at least 5 at 500+ test scale
- test-anatomy-standards.md: 6 standards (TA1-TA6), each with 2+ suite citations
- coverage-standards.md: 5 standards (COV1-COV5), each with decision framework + evidence
- structure-standards.md expanded: 5 new standards (S8-S12) with transition hurdle documentation
- Cross-reference accuracy: 93%+ (matching original campaign)
- Zero contradictions between new and existing standards
- All deliverables updated (templates, checklist, glossary, quality criteria, section guides)
- Previous rounds 1-55 audited against new findings
