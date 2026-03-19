# Phase 2 Execution Plan — Test Anatomy, Coverage Strategy, Scaling Organization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Execute 42 research rounds (56-97) to fill three gaps in the Playwright automation standards: test anatomy, coverage strategy, and scaling organization.

**Architecture:** Layered Spiral with Shared Discovery — Phase 1 re-analyzes all Gold suites and discovers new large-scale suites through ALL three lenses simultaneously. Phase 2 does dedicated deep dives per topic. Phases 3-5 draft, validate, and deliver. Each round follows research → extract → distill → validate → update cycle.

**Tech Stack:** Web search, GitHub, Playwright docs, open-source repos, Markdown

**Design doc:** `docs/plans/2026-03-19-phase2-research-design.md`

---

### Task 0: Scaffold Phase 2 Files

**Files:**
- Create: `research/synthesis/anatomy-patterns.md`
- Create: `research/synthesis/coverage-patterns.md`
- Create: `standards/test-anatomy-standards.md`
- Create: `standards/coverage-standards.md`

**Step 1: Create new synthesis files**

Create `research/synthesis/anatomy-patterns.md`:

```markdown
# Test Anatomy Patterns

> Cross-round synthesis of internal test structure patterns.
> To be populated through research rounds 56-75.

## AAA Pattern Observations

## Single Responsibility Observations

## Step Usage Observations

## Setup Placement Observations

## Assertion Density Observations

## Independence & Determinism Observations
```

Create `research/synthesis/coverage-patterns.md`:

```markdown
# Coverage Strategy Patterns

> Cross-round synthesis of coverage strategy patterns.
> To be populated through research rounds 56-75.

## E2E Boundary Observations

## Coverage Tier Observations

## Prioritization Observations

## Negative/Edge Case Observations

## Coverage Measurement Observations
```

**Step 2: Create new standards seed files**

Create `standards/test-anatomy-standards.md`:

```markdown
# Test Anatomy Standards

> PRELIMINARY — to be populated through research rounds 56-97.

---

## TA1. Arrange-Act-Assert Pattern

## TA2. Single Responsibility

## TA3. Test Step Usage

## TA4. Setup Placement

## TA5. Assertion Patterns

## TA6. Test Independence & Determinism
```

Create `standards/coverage-standards.md`:

```markdown
# Coverage Strategy Standards

> PRELIMINARY — to be populated through research rounds 56-97.

---

## COV1. E2E Testing Boundaries

## COV2. Coverage Tiers

## COV3. Prioritization & Growth Strategy

## COV4. Negative & Edge Case Testing

## COV5. Coverage Measurement & Health
```

**Step 3: Commit**

```bash
git add research/synthesis/anatomy-patterns.md research/synthesis/coverage-patterns.md standards/test-anatomy-standards.md standards/coverage-standards.md
git commit -m "scaffold: initialize phase 2 files for anatomy, coverage, and scaling research

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 1: Landscape Rounds 56-57 — Re-Analyze Gold Suites 1-5

**Files:**
- Create: `research/raw/rounds/round-56-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-56-landscape/findings.md`
- Create: `research/raw/rounds/round-57-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-57-landscape/findings.md`
- Update: `research/raw/suite-analyses/grafana.md` (append new sections)
- Update: `research/raw/suite-analyses/calcom.md` (append new sections)
- Update: `research/raw/suite-analyses/affine.md` (append new sections)
- Update: `research/raw/suite-analyses/immich.md` (append new sections)
- Update: `research/raw/suite-analyses/freecodecamp.md` (append new sections)
- Update: `research/sources.md`

**Step 1: Round 56 — Re-analyze Grafana and Cal.com through three lenses**

For each suite, use GitHub code search and web search to analyze:

**Test Anatomy lens:**
- Read 10+ individual test files. For each, record: Does it follow AAA? How is setup done (inline, beforeEach, fixture)? How many assertions? Does it use test.step()? Is it self-contained?
- Search for `test.step(` usage frequency
- Search for `test.describe.serial` usage
- Count average assertions per test (sample 20 tests)

**Coverage Strategy lens:**
- What features/areas have E2E tests vs. what's left to unit/integration?
- Search for tag usage (`@smoke`, `@critical`, `@regression`, `@slow`)
- Is there a documented testing strategy or contributor guide explaining what to test?
- Count test files per feature area — what's heavily tested vs. lightly?

**Scaling lens:**
- Total test count, file count, fixture count, project count
- Directory depth and organization complexity
- Config file line count and number of projects
- CI workflow complexity (shard count, execution time if documented)
- How many contributors touch test files (git shortlog)

Record findings in `round-56-landscape/findings.md` and update the existing suite analysis files with new "Test Anatomy", "Coverage Strategy", and "Scaling Profile" sections.

**Step 2: Round 57 — Re-analyze AFFiNE, Immich, and freeCodeCamp**

Same three-lens analysis as Round 56 for:
- AFFiNE — multi-platform (web, desktop, mobile), 5-shard CI
- Immich — Docker-based, API-heavy, DTO factories
- freeCodeCamp — largest OSS learning platform, Cypress migration

Record findings and update suite analysis files.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-56-landscape research/raw/rounds/round-57-landscape research/raw/suite-analyses research/sources.md
git commit -m "research: landscape rounds 56-57 — re-analyze Gold suites 1-5 for anatomy, coverage, scaling

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 2: Landscape Rounds 58-59 — Re-Analyze Gold Suites 6-10

**Files:**
- Create: `research/raw/rounds/round-58-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-58-landscape/findings.md`
- Create: `research/raw/rounds/round-59-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-59-landscape/findings.md`
- Update: `research/raw/suite-analyses/excalidraw.md` (append new sections)
- Update: `research/raw/suite-analyses/slate.md` (append new sections)
- Update: `research/raw/suite-analyses/supabase.md` (append new sections)
- Update: `research/raw/suite-analyses/nextjs.md` (append new sections)
- Update: `research/raw/suite-analyses/grafana-plugin-e2e.md` (append new sections)
- Update: `research/sources.md`

**Step 1: Round 58 — Re-analyze Excalidraw, Slate, and Supabase**

Same three-lens analysis (anatomy, coverage, scaling) as rounds 56-57 for:
- Excalidraw — visual/a11y focus, canvas-heavy tests
- Slate — rich text editor, cross-browser interaction testing
- Supabase — Postgres platform, auth session handling

**Step 2: Round 59 — Re-analyze Next.js and Grafana plugin-e2e**

Same three-lens analysis for:
- Next.js — framework-level testing, with-playwright template
- Grafana plugin-e2e — published package, custom fixtures + matchers

**Step 3: Commit**

```bash
git add research/raw/rounds/round-58-landscape research/raw/rounds/round-59-landscape research/raw/suite-analyses research/sources.md
git commit -m "research: landscape rounds 58-59 — re-analyze Gold suites 6-10 for anatomy, coverage, scaling

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 3: Landscape Rounds 60-61 — Discover New Large-Scale Suites

**Files:**
- Create: `research/raw/rounds/round-60-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-60-landscape/findings.md`
- Create: `research/raw/rounds/round-61-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-61-landscape/findings.md`
- Create: `research/raw/suite-analyses/[new-suite].md` (for deep-dive candidates)
- Update: `research/sources.md`

**Step 1: Round 60 — Search for mega-scale Playwright suites**

Use web search and GitHub to find suites with 500+ Playwright tests. Search queries:
- `"playwright.config.ts" language:TypeScript` on GitHub, sorted by stars
- `"@playwright/test" path:package.json` on GitHub, filter for large repos
- "playwright e2e large scale" site:github.com
- "vscode playwright tests" / "chromium playwright tests"
- "playwright 1000 tests" / "playwright large suite"
- Search for enterprise-scale suites: Shopify, Stripe, Mozilla, GitLab, WordPress

For each suite found, record in `suites-analyzed.md`:
- Project name, GitHub URL, stars, last active
- Test count (approximate), file count, project count
- What makes this suite interesting for anatomy/coverage/scaling analysis
- Quality tier estimate (Gold/Silver/Bronze)

**Step 2: Round 61 — Search for suites with mature coverage strategies**

Targeted searches for suites that demonstrate coverage thinking:
- `"@smoke" "@regression" "playwright"` on GitHub
- `"test.describe" "test.step" path:*.spec.ts` for step-heavy suites
- Search n8n, Directus, Strapi, Outline, Documenso for coverage patterns
- Search Angular, Svelte, Remix, SolidJS for framework-level Playwright patterns
- "playwright testing strategy" / "playwright what to test" blog posts and guides
- "playwright test coverage" / "playwright coverage tiers"

Record new suites and coverage strategy resources in findings.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-60-landscape research/raw/rounds/round-61-landscape research/raw/suite-analyses research/sources.md
git commit -m "research: landscape rounds 60-61 — discover new large-scale and coverage-mature suites

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 4: Landscape Rounds 62-63 — Discovery Continued + Synthesis Checkpoint

**Files:**
- Create: `research/raw/rounds/round-62-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-62-landscape/findings.md`
- Create: `research/raw/rounds/round-63-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-63-landscape/findings.md`
- Create: `research/raw/rounds/round-63-landscape/audit-notes.md`
- Update: `research/synthesis/anatomy-patterns.md` (initial population)
- Update: `research/synthesis/coverage-patterns.md` (initial population)
- Update: `research/synthesis/structural-patterns.md` (add scaling section)
- Update: `research/sources.md`

**Step 1: Round 62 — Fill discovery gaps and analyze new suites**

Review all findings from rounds 56-61. Identify gaps:
- Any scale tier underrepresented? (Need at least 3 suites per tier: Small, Medium, Large, Enterprise)
- Any topic lens underrepresented? (Need anatomy, coverage, and scaling data for each)
- Do targeted searches to fill gaps.

For the most promising new suites from rounds 60-61, do three-lens analysis (same depth as Gold suite re-analysis).

**Step 2: Round 63 — Synthesis checkpoint**

Populate all synthesis files with initial patterns observed across the landscape:

`anatomy-patterns.md`:
- Record AAA pattern compliance rates across all analyzed suites
- Record step usage frequency and patterns
- Record assertion density distributions
- Record setup placement strategies
- Note which patterns correlate with Gold vs. Silver vs. Bronze tiers

`coverage-patterns.md`:
- Record what feature areas Gold suites test at E2E level
- Record tag usage patterns across suites
- Record coverage tier structures where observed
- Record negative/edge case testing patterns
- Note coverage strategy documentation presence

`structural-patterns.md` (update with scaling section):
- Record scale indicators for all analyzed suites
- Record directory organization complexity by test count
- Record config complexity by project count
- Note transition patterns visible in git history

Write `audit-notes.md` documenting:
- How many total suites now analyzed for Phase 2 (target: 25-30)
- Which scale tiers are well-represented
- Preliminary patterns strong enough to draft standards
- Gaps to address in deep dive phase

**Step 3: Commit**

```bash
git add research/raw/rounds/round-62-landscape research/raw/rounds/round-63-landscape research/synthesis research/sources.md
git commit -m "research: landscape rounds 62-63 — synthesis checkpoint, initial patterns for anatomy, coverage, scaling

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 5: Anatomy Deep Dives — Rounds 64-67

**Files:**
- Create: `research/raw/rounds/round-64-anatomy/suites-analyzed.md`
- Create: `research/raw/rounds/round-64-anatomy/findings.md`
- Create: `research/raw/rounds/round-65-anatomy/suites-analyzed.md`
- Create: `research/raw/rounds/round-65-anatomy/findings.md`
- Create: `research/raw/rounds/round-66-anatomy/suites-analyzed.md`
- Create: `research/raw/rounds/round-66-anatomy/findings.md`
- Create: `research/raw/rounds/round-67-anatomy/suites-analyzed.md`
- Create: `research/raw/rounds/round-67-anatomy/findings.md`
- Update: `research/synthesis/anatomy-patterns.md`

**Step 1: Rounds 64-65 — Deep analysis of individual test structure in Gold suites**

Select 8-10 suites with the most interesting internal test patterns (from landscape findings). For each suite, read 10-15 individual test files and for EACH test, record:

- Does it follow AAA (Arrange-Act-Assert)? How strictly?
- How is the "Arrange" phase done? (inline setup, `beforeEach`, fixture, factory call, API call)
- How many assertions does it contain? Where are they placed?
- Does it use `test.step()`? How many steps? What's the naming pattern?
- Is the test self-contained or does it depend on other tests?
- How long is the test (lines of code)?
- What's the describe-to-test nesting depth?

Search for blog posts, conference talks, and documentation about:
- "playwright test structure best practices"
- "playwright AAA pattern"
- "playwright test.step best practices"
- "playwright single responsibility test"
- "how to structure playwright tests"
- Playwright official docs on test structure and best practices

**Step 2: Rounds 66-67 — Assertion patterns and setup placement analysis**

Focus specifically on:
- **Assertion patterns:** Count assertion-to-action ratios across 50+ tests. Document guard assertion usage (toBeVisible before click). Document how suites mix hard/soft assertions. Analyze assertion ordering conventions (guard → action → outcome).
- **Setup placement:** For the same 50+ tests, categorize setup approach: inline (inside test body), beforeEach (in describe block), fixture (via test.extend), factory (via utility function), API (via request context). Calculate distribution percentages per suite.
- **Independence patterns:** Search for `test.describe.serial` usage. Search for tests that reference data created by other tests. Document how suites ensure test independence in parallel execution.
- Search for community guidance:
  - "playwright beforeEach vs fixture" patterns
  - "playwright test isolation patterns"
  - "playwright assertion best practices"

Update `anatomy-patterns.md` with detailed evidence and frequency counts.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-6{4,5,6,7}-anatomy research/synthesis/anatomy-patterns.md
git commit -m "research: anatomy deep dives rounds 64-67 — individual test structure, assertions, setup patterns

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 6: Coverage Strategy Deep Dives — Rounds 68-71

**Files:**
- Create: `research/raw/rounds/round-68-coverage/suites-analyzed.md`
- Create: `research/raw/rounds/round-68-coverage/findings.md`
- Create: `research/raw/rounds/round-69-coverage/suites-analyzed.md`
- Create: `research/raw/rounds/round-69-coverage/findings.md`
- Create: `research/raw/rounds/round-70-coverage/suites-analyzed.md`
- Create: `research/raw/rounds/round-70-coverage/findings.md`
- Create: `research/raw/rounds/round-71-coverage/suites-analyzed.md`
- Create: `research/raw/rounds/round-71-coverage/findings.md`
- Update: `research/synthesis/coverage-patterns.md`

**Step 1: Rounds 68-69 — E2E boundaries and coverage tiers**

Analyze what Gold suites test at E2E level vs. what they leave to unit/integration:
- For each Gold suite, list the application features. Which have E2E tests? Which don't?
- Where suites have BOTH E2E and unit tests, compare what each layer covers
- Search for `@smoke`, `@critical`, `@regression`, `@slow`, `@nightly` tag usage across all analyzed suites
- Map tag-to-tier correspondence where it exists
- Search for CI workflow configurations that run different test subsets (PR vs. merge vs. nightly)

Search for community guidance:
- "playwright what to test at e2e level"
- "playwright testing strategy" / "e2e testing strategy"
- "testing pyramid playwright"
- "playwright smoke tests vs regression tests"
- "when not to use e2e tests"
- Blog posts from testing thought leaders (Kent C. Dodds, Gleb Bahmutov, etc.) on E2E boundaries
- Playwright official best practices on test scope

**Step 2: Rounds 70-71 — Coverage growth, negative testing, and measurement**

Analyze coverage growth patterns:
- Use `git log --oneline -- '*.spec.ts'` or similar to trace test growth over time for 3-5 large suites
- Identify which features got E2E tests first (initial coverage priority)
- Document how test counts grew relative to feature development

Analyze negative/edge case testing:
- Search for tests covering error states, permission denials, empty states, boundary conditions
- For 5+ suites, calculate the ratio of happy-path to negative-path tests
- Document where negative testing is done at E2E vs. unit level

Analyze coverage measurement:
- Search for "playwright test coverage" / "playwright code coverage"
- Search for feature coverage tracking tools and approaches
- Search for test audit practices (detecting untested features)
- Search for ROI analysis patterns (maintenance cost vs. value)

Update `coverage-patterns.md` with evidence and frequency counts.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-{68,69,70,71}-coverage research/synthesis/coverage-patterns.md
git commit -m "research: coverage deep dives rounds 68-71 — E2E boundaries, tiers, growth, negative testing

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 7: Scaling Organization Deep Dives — Rounds 72-75

**Files:**
- Create: `research/raw/rounds/round-72-scaling/suites-analyzed.md`
- Create: `research/raw/rounds/round-72-scaling/findings.md`
- Create: `research/raw/rounds/round-73-scaling/suites-analyzed.md`
- Create: `research/raw/rounds/round-73-scaling/findings.md`
- Create: `research/raw/rounds/round-74-scaling/suites-analyzed.md`
- Create: `research/raw/rounds/round-74-scaling/findings.md`
- Create: `research/raw/rounds/round-75-scaling/suites-analyzed.md`
- Create: `research/raw/rounds/round-75-scaling/findings.md`
- Create: `research/raw/rounds/round-75-scaling/audit-notes.md`
- Update: `research/synthesis/structural-patterns.md` (scaling section)

**Step 1: Rounds 72-73 — Enterprise-scale suite analysis**

Deep analysis of the largest suites (1000+ tests):
- Grafana (31 projects) — How is the config organized? How are fixtures segmented? How do teams own test areas?
- VS Code / any other mega-suite discovered in landscape phase
- Any enterprise suite with documented scaling challenges

For each, analyze:
- **Directory structure:** depth, naming, cross-feature test placement, shared utilities location
- **Config composition:** How many config files? How are projects defined? Factory patterns? Shared config objects?
- **Fixture dependency graph:** Map fixture imports/dependencies for the 10 most-used fixtures. Identify circular dependencies or bottlenecks.
- **Execution strategy:** How are tests split across CI runs (PR/merge/nightly)? Shard count? Selective execution by changed files?
- **Team ownership:** CODEOWNERS patterns, team-scoped directories, PR review patterns for test changes

Search for community guidance:
- "playwright scaling large test suite"
- "playwright enterprise testing"
- "playwright monorepo testing"
- "playwright config composition"
- "playwright multiple config files"
- "playwright CODEOWNERS testing"
- "managing large playwright test suites"

**Step 2: Rounds 74-75 — Transition patterns and audit checkpoint**

Study transition events via git history:
- For 3-5 suites, find commits where directory structure was reorganized
- Find commits where config was refactored (project additions, config splits)
- Find commits where fixture files were split or reorganized
- Document what triggered each restructuring (test count? CI time? team growth?)

Search for:
- "playwright migration from small to large"
- "playwright reorganize test suite"
- "playwright config refactoring"
- Blog posts about scaling test suites (not just Playwright — Cypress, Selenium experience reports apply)

**Audit checkpoint (round 75):** Write `audit-notes.md`:
- Review rounds 1-55 findings for anything that contradicts or extends new scaling evidence
- Do any existing standards (S1-S7) need revision based on new evidence?
- Are the proposed standard IDs (TA1-6, COV1-5, S8-12) still the right decomposition?
- List preliminary standard claims ready for drafting

Update `structural-patterns.md` with scaling patterns, transition triggers, and hurdle documentation.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-7{2,3,4,5}-scaling research/synthesis/structural-patterns.md
git commit -m "research: scaling deep dives rounds 72-75 — enterprise analysis, transitions, audit checkpoint

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 8: Draft Test Anatomy Standards — Rounds 76-77

**Files:**
- Create: `research/raw/rounds/round-76-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-76-drafting/findings.md`
- Create: `research/raw/rounds/round-77-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-77-drafting/findings.md`
- Update: `standards/test-anatomy-standards.md` (write full draft)

**Step 1: Round 76 — Draft TA1-TA3**

Write `standards/test-anatomy-standards.md` for TA1-TA3, following the EXACT format of existing standards (see `standards/structure-standards.md` for reference):

Each standard gets:
- Standard ID and title
- Clear recommendation with MUST/SHOULD/MAY language
- Rationale explaining why
- Evidence with specific suite citations (e.g., "7/10 Gold suites follow this pattern [suite1, suite2, ...]")
- Code examples showing the recommended pattern
- Valid alternatives with trade-offs
- Anti-patterns with explanations

**TA1 (Arrange-Act-Assert):** Document the canonical pattern, evidence of compliance rates, when to deviate (e.g., multi-step workflows), how AAA maps to Playwright specifically (navigation=arrange, interaction=act, expect=assert).

**TA2 (Single Responsibility):** Resolve the tension between "one behavior per test" and "fewer, longer tests with steps." Provide a decision framework based on evidence.

**TA3 (Test Step Usage):** When to use `test.step()`, step naming conventions, step granularity, steps as documentation vs. splitting into tests.

**Step 2: Round 77 — Draft TA4-TA6**

**TA4 (Setup Placement):** Decision framework for inline vs. beforeEach vs. fixture vs. factory. Include evidence-based distribution percentages.

**TA5 (Assertion Patterns):** Assertion density guidance, ordering conventions, guard-action-outcome pattern, hard vs. soft assertion mixing.

**TA6 (Test Independence):** No-order-dependency rules, shared-state avoidance, self-contained data, handling sequential operations.

Mark the document as "DRAFT — to be validated in rounds 82-83."

**Step 3: Commit**

```bash
git add research/raw/rounds/round-7{6,7}-drafting standards/test-anatomy-standards.md
git commit -m "research: drafting rounds 76-77 — draft test-anatomy-standards.md (TA1-TA6)

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 9: Draft Coverage Strategy Standards — Rounds 78-79

**Files:**
- Create: `research/raw/rounds/round-78-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-78-drafting/findings.md`
- Create: `research/raw/rounds/round-79-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-79-drafting/findings.md`
- Update: `standards/coverage-standards.md` (write full draft)

**Step 1: Round 78 — Draft COV1-COV3**

Write `standards/coverage-standards.md` for COV1-COV3, same format as existing standards:

**COV1 (E2E Testing Boundaries):** Decision framework with clear criteria for E2E vs. unit/integration. Include a decision tree or table. Evidence from Gold suites showing what they cover at each level.

**COV2 (Coverage Tiers):** Define four tiers with concrete examples:
- Smoke (critical path, <5 min): login, core workflow, happy path
- Regression (feature coverage, <30 min): feature-area coverage, key scenarios
- Comprehensive (edge cases, <2 hrs): negative paths, boundary conditions, multi-role
- Nightly (full matrix, uncapped): cross-browser, visual regression, performance

Include tag conventions, CI trigger mapping, and how Gold suites implement tiers.

**COV3 (Prioritization & Growth):** Risk-based criteria, build order guidance, coverage growth over time evidence from git history analysis.

**Step 2: Round 79 — Draft COV4-COV5**

**COV4 (Negative & Edge Case Testing):** Framework for which negative tests belong at E2E level. Evidence from Gold suites.

**COV5 (Coverage Measurement & Health):** Feature coverage tracking, audit practices, diminishing returns signals, maintenance cost vs. value.

Mark as "DRAFT — to be validated in rounds 82-83."

**Step 3: Commit**

```bash
git add research/raw/rounds/round-7{8,9}-drafting standards/coverage-standards.md
git commit -m "research: drafting rounds 78-79 — draft coverage-standards.md (COV1-COV5)

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 10: Draft Scaling Standards S8-S12 — Rounds 80-81

**Files:**
- Create: `research/raw/rounds/round-80-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-80-drafting/findings.md`
- Create: `research/raw/rounds/round-81-drafting/suites-analyzed.md`
- Create: `research/raw/rounds/round-81-drafting/findings.md`
- Update: `standards/structure-standards.md` (append S8-S12)

**Step 1: Round 80 — Draft S8-S10**

Append to `standards/structure-standards.md`, continuing after the existing S7/Maturity Spectrum section:

**S8 (Scale Tiers & Transition Triggers):** Four tiers with concrete metrics. Transition hurdles matrix. Evidence from suites at each tier.

**S9 (Directory & File Scaling):** Splitting triggers, cross-feature test placement, shared utilities organization, monorepo patterns.

**S10 (Configuration Scaling):** Config composition patterns, factory functions, per-domain configs, evidence from Grafana (31 projects).

**Step 2: Round 81 — Draft S11-S12**

**S11 (Fixture & Dependency Scaling):** Module boundaries, dependency graph management, multi-team governance.

**S12 (Execution Strategy at Scale):** Tiered execution, selective runs, execution budgets, shard evolution, CODEOWNERS.

Mark new sections as "DRAFT — to be validated in rounds 82-83."

**Step 3: Commit**

```bash
git add research/raw/rounds/round-8{0,1}-drafting standards/structure-standards.md
git commit -m "research: drafting rounds 80-81 — draft scaling standards S8-S12 in structure-standards.md

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 11: Validate Drafts Against Fresh Suites — Rounds 82-83

**Files:**
- Create: `research/raw/rounds/round-82-validation/suites-analyzed.md`
- Create: `research/raw/rounds/round-82-validation/findings.md`
- Create: `research/raw/rounds/round-83-validation/suites-analyzed.md`
- Create: `research/raw/rounds/round-83-validation/findings.md`
- Create: `research/raw/rounds/round-83-validation/audit-notes.md`
- Update: `standards/test-anatomy-standards.md` (revise based on validation)
- Update: `standards/coverage-standards.md` (revise based on validation)
- Update: `standards/structure-standards.md` (revise S8-S12 based on validation)

**Step 1: Round 82 — Find 5-10 fresh suites not yet analyzed**

Search for Playwright suites NOT in the existing sources.md:
- Different industries (healthcare, fintech, education, gaming)
- Different sizes (ensure coverage of all four scale tiers)
- Different regions/communities (non-US open source projects)

For each fresh suite, apply ALL new draft standards as a rubric:
- Does TA1-TA6 predict their internal test patterns?
- Does COV1-COV5 match their coverage approach?
- Does S8-S12 match their organizational patterns?

Record where standards are confirmed and where they fail.

**Step 2: Round 83 — Revise standards based on validation**

Write `audit-notes.md`:
- Which standards were confirmed by fresh suites
- Which standards need revision
- Any new patterns observed that aren't captured in drafts
- Accuracy rate (target: 90%+ at this stage)

Revise all three draft documents based on validation findings. Resolve any contradictions.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-8{2,3}-validation standards
git commit -m "research: validation rounds 82-83 — validate draft standards against fresh suites, revise

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 12: Audit New Standards Against Existing — Rounds 84-85

**Files:**
- Create: `research/raw/rounds/round-84-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-84-crossval/findings.md`
- Create: `research/raw/rounds/round-85-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-85-crossval/findings.md`
- Create: `research/raw/rounds/round-85-crossval/audit-notes.md`
- Update: Any standards files where contradictions are found

**Step 1: Round 84 — Cross-reference new standards with existing S1-S7, V1-V6, C1-C7**

Read ALL existing standards documents end-to-end. For each new standard (TA1-6, COV1-5, S8-12), check:
- Does it contradict any existing standard?
- Does it use terminology consistently with the glossary?
- Are there cross-references that should be added? (e.g., TA4 references S4 fixtures, COV2 references C7 cost optimization)
- Does the decision framework in COV1 align with V1 assertions and V6 isolation?

Record all cross-reference opportunities and contradictions.

**Step 2: Round 85 — Resolve contradictions and add cross-references**

Fix any contradictions found. Add cross-references between new and existing standards. Ensure consistent MUST/SHOULD/MAY usage.

Write `audit-notes.md`:
- Number of contradictions found and resolved
- Cross-references added
- Terminology corrections
- Consistency improvements

**Step 3: Commit**

```bash
git add research/raw/rounds/round-8{4,5}-crossval standards
git commit -m "research: cross-validation rounds 84-85 — audit new standards against existing, resolve contradictions

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 13: Audit Rounds 1-55 Against New Research — Rounds 86-87

**Files:**
- Create: `research/raw/rounds/round-86-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-86-crossval/findings.md`
- Create: `research/raw/rounds/round-87-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-87-crossval/findings.md`
- Create: `research/raw/rounds/round-87-crossval/audit-notes.md`
- Update: Any existing standards files that need revision

**Step 1: Round 86 — Review early rounds (1-32) against new evidence**

Read findings from key rounds (10, 12, 22, 32 — the original audit checkpoints). Ask:
- Do any earlier findings need revision in light of new anatomy/coverage/scaling evidence?
- Did early rounds observe patterns that should now be formalized as standards?
- Are there patterns mentioned in passing in early rounds that the new standards should capture?
- Did the original Gold suite analyses miss anatomy/coverage/scaling signals?

**Step 2: Round 87 — Review later rounds (33-55) and synthesis files**

Read findings from rounds 33-55 (performance, security, semantics, cross-validation). Ask:
- Do performance standards (P1-P7) interact with coverage tiers (COV2)?
- Do CI/CD standards (C1-C7) interact with execution strategy (S12)?
- Do existing cross-validation audit notes mention any of the three gaps?
- Update any existing standards where new evidence strengthens or modifies claims.

Write `audit-notes.md`:
- Changes made to existing standards (rounds 1-55 artifacts)
- Patterns from early rounds now formalized in new standards
- Confirmed that no existing standard needs reversal

**Step 3: Commit**

```bash
git add research/raw/rounds/round-8{6,7}-crossval standards research/synthesis
git commit -m "research: cross-validation rounds 86-87 — audit rounds 1-55 against new research findings

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 14: Fresh Suite Validation — Rounds 88-89

**Files:**
- Create: `research/raw/rounds/round-88-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-88-crossval/findings.md`
- Create: `research/raw/rounds/round-89-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-89-crossval/findings.md`
- Create: `research/raw/rounds/round-89-crossval/audit-notes.md`
- Update: `research/sources.md`

**Step 1: Round 88 — Find 5-8 completely fresh suites**

These must be suites NOT in sources.md at all — completely new evidence. Search for:
- Recently created Playwright suites (2025-2026)
- Suites in different ecosystems (.NET, Python, Java projects using Playwright)
- Suites from non-English-speaking communities
- Suites with unique organizational patterns

Apply ALL standards (old + new) as a rubric. For each suite, score:
- Structure (S1-S12): X/Y standards match
- Test Anatomy (TA1-TA6): X/Y standards match
- Coverage (COV1-COV5): X/Y standards match
- Validation (V1-V6): X/Y standards match

**Step 2: Round 89 — Calculate accuracy and document**

Write `audit-notes.md`:
- Overall accuracy rate across all suites tested (target: 93%+)
- Per-domain accuracy rates
- False positives (standards that predict patterns not present)
- False negatives (patterns present that standards don't capture)
- Any final revisions needed

Update `research/sources.md` with all new suites.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-8{8,9}-crossval research/sources.md
git commit -m "research: cross-validation rounds 88-89 — fresh suite validation, 93%+ accuracy target

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 15: Resolve Contradictions and Finalize Standards — Rounds 90-91

**Files:**
- Create: `research/raw/rounds/round-90-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-90-crossval/findings.md`
- Create: `research/raw/rounds/round-91-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-91-crossval/findings.md`
- Create: `research/raw/rounds/round-91-crossval/audit-notes.md`
- Update: `standards/test-anatomy-standards.md` (mark FINAL)
- Update: `standards/coverage-standards.md` (mark FINAL)
- Update: `standards/structure-standards.md` (mark S8-S12 FINAL)

**Step 1: Round 90 — Resolve all remaining contradictions**

Review ALL audit-notes.md files from rounds 63, 75, 83, 85, 87, 89. For any unresolved contradictions:
- Do targeted research to resolve
- If genuinely contested, document both positions in the standard
- Ensure the transition hurdles in S8 align with evidence from all phases

**Step 2: Round 91 — Final wording pass and mark FINAL**

Read all three new/expanded standards documents end-to-end. Ensure:
- Every claim has 2+ suite citations
- Decision frameworks are clear and actionable
- Anti-patterns are documented for each standard
- Valid alternatives are listed where applicable
- Transition hurdles matrix in S8 is evidence-based
- Coverage tier definitions in COV2 are concrete with examples

Change document headers from DRAFT to FINAL. Add revision history entries.

Write `audit-notes.md`:
- Total contradictions resolved: N
- Total standards finalized: 16 (TA1-6, COV1-5, S8-12)
- Total suites analyzed in Phase 2: N
- Accuracy rate achieved: N%

**Step 3: Commit**

```bash
git add research/raw/rounds/round-9{0,1}-crossval standards
git commit -m "research: cross-validation rounds 90-91 — finalize all new standards, mark FINAL

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 16: Update Templates and Section Guides — Rounds 92-93

**Files:**
- Update: `templates/suite-template/tests/example.spec.ts` (add anatomy patterns)
- Update: `templates/suite-template/playwright.config.ts` (add scaling comments)
- Update: `templates/suite-template/README.md` (add coverage and scaling sections)
- Create: `templates/section-guides/test-anatomy-guide.md`
- Create: `templates/section-guides/coverage-guide.md`
- Create: `templates/section-guides/scaling-guide.md`
- Create: `research/raw/rounds/round-92-deliverables/findings.md`
- Create: `research/raw/rounds/round-93-deliverables/findings.md`

**Step 1: Round 92 — Update suite template**

Update example test files to demonstrate TA1-TA6:
- AAA pattern in action
- Proper step usage for multi-phase tests
- Correct assertion ordering (guard-action-outcome)
- Proper setup placement (fixture-based)

Update `playwright.config.ts` with comments showing scaling decision points:
- Where to add projects as suite grows
- When to consider config splitting
- Execution tier configuration examples

Update `README.md` with:
- Coverage strategy section (referencing COV1-COV5)
- Scaling roadmap (referencing S8-S12)
- Test anatomy conventions (referencing TA1-TA6)

**Step 2: Round 93 — Create new section guides**

Create three new section guides following the format of existing guides:

`test-anatomy-guide.md`:
- Purpose and principles
- AAA walkthrough with code examples
- Step usage decision tree
- Setup placement decision tree
- Common mistakes and fixes

`coverage-guide.md`:
- E2E boundary decision framework (flowchart)
- Coverage tier setup guide
- Tag convention setup
- CI configuration for tiered execution
- Coverage audit checklist

`scaling-guide.md`:
- Scale tier self-assessment
- Transition playbooks (Small→Medium, Medium→Large, Large→Enterprise)
- Directory restructuring guide
- Config composition guide
- Team ownership setup guide

**Step 3: Commit**

```bash
git add templates research/raw/rounds/round-9{2,3}-deliverables
git commit -m "deliverable: update suite template and create anatomy, coverage, scaling section guides

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 17: Update Checklist, Quality Criteria, and Glossary — Rounds 94-95

**Files:**
- Update: `checklist/pre-creation-checklist.md` (add sections 8-9, expand section 1)
- Update: `standards/quality-criteria.md` (expand Q2, Q5, Q6)
- Update: `glossary/playwright-glossary.md` (add new terms)
- Create: `research/raw/rounds/round-94-deliverables/findings.md`
- Create: `research/raw/rounds/round-95-deliverables/findings.md`

**Step 1: Round 94 — Update checklist**

Add to `checklist/pre-creation-checklist.md`:

**Section 8 — Test Anatomy Checklist:**
- Yes/no items for TA1-TA6 (e.g., "Do tests follow the Arrange-Act-Assert pattern? [TA1]")
- Each item linked to its standard ID

**Section 9 — Coverage Strategy Checklist:**
- Yes/no items for COV1-COV5 (e.g., "Is there a documented E2E testing boundary? [COV1]")
- Each item linked to its standard ID

**Expand Section 1 — Structure Checklist:**
- Add items for S8-S12 (e.g., "Is the current scale tier documented with transition triggers? [S8]")

**Step 2: Round 95 — Update quality criteria and glossary**

Update `standards/quality-criteria.md`:
- Q2: Add "Test Anatomy Quality" (Q2.8) and "Coverage Strategy" (Q2.9) evaluation dimensions
- Q5: Add anatomy and coverage scoring domains to the validation rubric
- Q6: Expand unified rubric from 7 to 9 domains (add Anatomy, Coverage). Recalculate maximum score (27 instead of 21). Recalculate tier boundaries. Add scoring examples for the new domains.
- Q6.3: Add Gold/Silver/Bronze examples showing anatomy and coverage scores

Update `glossary/playwright-glossary.md` with new terms:
- AAA pattern, Arrange-Act-Assert
- Coverage tier (smoke, regression, comprehensive, nightly)
- Critical path test
- Scale tier (small, medium, large, enterprise)
- Test independence / test isolation (distinguish from V6 isolation)
- Execution budget
- Coverage debt
- Transition trigger
- Test anatomy
- Guard assertion (reference from V1.2, formalize here)

**Step 3: Commit**

```bash
git add checklist standards/quality-criteria.md glossary research/raw/rounds/round-9{4,5}-deliverables
git commit -m "deliverable: update checklist with anatomy/coverage sections, expand quality criteria to 9 domains, add glossary terms

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 18: Final Synthesis and Consistency Pass — Rounds 96-97

**Files:**
- Update: `research/synthesis/anatomy-patterns.md` (finalize)
- Update: `research/synthesis/coverage-patterns.md` (finalize)
- Update: `research/synthesis/structural-patterns.md` (finalize scaling section)
- Update: `research/sources.md` (ensure all new suites included)
- Update: `CLAUDE.md` (add new standards to documentation)
- Update: `README.md` (add Phase 2 outcomes)
- Create: `research/raw/rounds/round-96-deliverables/findings.md`
- Create: `research/raw/rounds/round-97-deliverables/findings.md`
- Create: `research/raw/rounds/round-97-deliverables/audit-notes.md`

**Step 1: Round 96 — Finalize synthesis files and sources**

Finalize `anatomy-patterns.md`:
- Ensure all pattern observations are backed by evidence
- Add frequency counts (e.g., "AAA observed in 8/10 Gold suites")
- Mark as FINAL

Finalize `coverage-patterns.md`:
- Same evidence and frequency count requirements
- Mark as FINAL

Update `structural-patterns.md`:
- Add scaling patterns section with evidence
- Mark scaling section as FINAL

Update `research/sources.md`:
- Ensure every new suite from Phase 2 is included
- Verify all citation keys are consistent across documents

**Step 2: Round 97 — Final consistency pass**

Read EVERY deliverable end-to-end in this order:
1. All standards documents (structure, validation, cicd, performance, security, semantic, anatomy, coverage, quality)
2. All synthesis files (6 files)
3. Checklist
4. Glossary
5. All section guides (11 guides)
6. Suite template files
7. Sources bibliography

Verify:
- No contradictions between ANY documents
- Glossary terms used in standards match glossary definitions
- Every checklist item maps to a standard ID that exists
- Every standard ID referenced in the checklist exists in a standards document
- Cross-references between documents are accurate
- Template follows all standards
- Section guides are consistent with standards
- Quality criteria scoring includes new domains

Update `CLAUDE.md`:
- Add new standards files to repository structure
- Add new standard ID ranges (TA1-TA6, COV1-COV5, S8-S12)
- Update research round count (97 total)
- Add new section guides to the structure listing

Update `README.md`:
- Add Phase 2 summary
- Update statistics (suite count, standard count, round count)

Write final `audit-notes.md`:
- Total rounds in Phase 2: 42 (56-97)
- Total new suites analyzed: N
- Total new standards: 16 (TA1-6, COV1-5, S8-12)
- Accuracy rate: N%
- Contradictions found and resolved: N
- Existing standards revised: N
- Deliverables updated: templates, checklist, glossary, quality criteria, section guides, CLAUDE.md, README.md

**Step 3: Commit**

```bash
git add research/synthesis research/sources.md research/raw/rounds/round-9{6,7}-deliverables CLAUDE.md README.md
git commit -m "docs: finalize Phase 2 — synthesis, consistency pass, update CLAUDE.md and README.md

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 19: Mark All Phase 2 Tasks Complete

**Files:**
- Create: `docs/plans/2026-03-19-phase2-execution-plan.md.tasks.json`

**Step 1: Write task persistence file**

Write the task persistence JSON to `docs/plans/2026-03-19-phase2-execution-plan.md.tasks.json` with all tasks marked as completed.

**Step 2: Final commit**

```bash
git add docs/plans/2026-03-19-phase2-execution-plan.md.tasks.json
git commit -m "chore: mark all Phase 2 tasks completed in task persistence file

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```
