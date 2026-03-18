# Playwright Automation Standards — Research Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Execute 55+ research rounds to distill Playwright automation suite standards into actionable reference documents.

**Architecture:** Source-First Spiral — rounds grouped by dimension (landscape → structure → validation → performance → security → semantics → synthesis), each round follows research → extract → distill → validate → update cycle. Raw research is separated from synthesis. All artifacts are Markdown.

**Tech Stack:** Web search, GitHub, Playwright docs, open-source repos, Markdown

---

### Task 0: Scaffold Repository Structure

**Files:**
- Create: `research/raw/rounds/.gitkeep`
- Create: `research/raw/suite-analyses/.gitkeep`
- Create: `research/synthesis/structural-patterns.md`
- Create: `research/synthesis/validation-patterns.md`
- Create: `research/synthesis/semantic-patterns.md`
- Create: `research/synthesis/rhetoric-patterns.md`
- Create: `research/synthesis/performance-patterns.md`
- Create: `research/synthesis/security-patterns.md`
- Create: `research/sources.md`
- Create: `standards/structure-standards.md`
- Create: `standards/validation-standards.md`
- Create: `standards/semantic-conventions.md`
- Create: `standards/cicd-standards.md`
- Create: `standards/performance-standards.md`
- Create: `standards/security-standards.md`
- Create: `standards/quality-criteria.md`
- Create: `templates/suite-template/.gitkeep`
- Create: `templates/section-guides/.gitkeep`
- Create: `checklist/pre-creation-checklist.md`
- Create: `glossary/playwright-glossary.md`

**Step 1: Create all directories and seed files**

Create every directory and file listed above. Each synthesis file starts with a header and empty sections. Each standards file starts with a header noting "To be populated through research rounds." The `sources.md` starts with a header and column format for the master bibliography:

```markdown
# Analyzed Sources — Master Bibliography

| Citation Key | Project | Stars | URL | Stack | Last Active | Notes |
|---|---|---|---|---|---|---|
```

**Step 2: Commit**

```bash
git add -A
git commit -m "scaffold: initialize repository structure for research rounds

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 1: Landscape Rounds 1-3 — Discover High-Quality Playwright Suites

**Files:**
- Create: `research/raw/rounds/round-01-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-01-landscape/findings.md`
- Create: `research/raw/rounds/round-02-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-02-landscape/findings.md`
- Create: `research/raw/rounds/round-03-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-03-landscape/findings.md`
- Update: `research/sources.md`

**Step 1: Round 1 — Search for well-known Playwright test suites in production projects**

Use web search and GitHub to find the most-starred and most-active projects that use Playwright for testing. Search queries:
- "playwright e2e tests" site:github.com
- "playwright test suite production" best practices
- awesome-playwright curated lists
- Playwright official examples and demo repos
- "playwright.config.ts" in popular open-source projects

For each suite found, record in `suites-analyzed.md`:
- Project name and GitHub URL
- Stars, last commit date, contributor count
- Stack (TypeScript/JavaScript, framework)
- Type of Playwright usage (E2E, API, visual, component, etc.)
- One-line summary of what makes this suite notable

Record in `findings.md`:
- What types of projects use Playwright in production
- Which industries/domains are represented
- Initial observations about quality tiers
- What distinguishes well-maintained suites from abandoned ones

**Step 2: Round 2 — Deep search for TypeScript-first Playwright suites**

Focus on TypeScript implementations specifically:
- Search GitHub for repos with `playwright.config.ts` (not .js)
- Look for projects using `@playwright/test` with TypeScript strict mode
- Search for suites with custom fixtures, POM patterns, and CI configs
- Look at Playwright's own test suite and contributor ecosystem

Record new suites and emerging patterns about TypeScript-specific conventions.

**Step 3: Round 3 — Search for Playwright in specific framework ecosystems**

Search for Playwright suites in:
- Next.js projects ("nextjs playwright e2e")
- React projects with Playwright
- NestJS projects with Playwright API testing
- Monorepo setups (Turborepo, Nx) with Playwright

Record how framework choice affects suite structure and conventions.

**Step 4: Update master bibliography**

Add all suites from rounds 1-3 to `research/sources.md` with full metadata.

**Step 5: Commit**

```bash
git add research/raw/rounds/round-01-landscape research/raw/rounds/round-02-landscape research/raw/rounds/round-03-landscape research/sources.md
git commit -m "research: landscape rounds 1-3 — discover high-quality Playwright suites

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 2: Landscape Rounds 4-6 — Map Ecosystem and Community Practices

**Files:**
- Create: `research/raw/rounds/round-04-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-04-landscape/findings.md`
- Create: `research/raw/rounds/round-05-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-05-landscape/findings.md`
- Create: `research/raw/rounds/round-06-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-06-landscape/findings.md`
- Update: `research/sources.md`

**Step 1: Round 4 — Search Playwright community resources and guides**

Search for community-maintained best practices:
- Playwright official documentation (best practices section)
- playwright.dev community guides
- Conference talks about Playwright at scale (YouTube, conference sites)
- Blog posts from companies describing their Playwright adoption
- "playwright best practices 2024 2025 2026"

Record what the community considers "best practice" and which patterns have consensus.

**Step 2: Round 5 — Search for Playwright suites with strong CI/CD integration**

Focus on suites with visible CI pipelines:
- Projects with `.github/workflows/` containing Playwright
- GitLab CI configurations with Playwright
- Docker-based Playwright setups
- Playwright sharding and parallelism configurations
- Projects using Playwright's built-in reporters in CI

Record CI/CD patterns and how suites handle environment management.

**Step 3: Round 6 — Search for specialized Playwright usage**

Search for suites using Playwright's full capability spectrum:
- Visual regression testing ("playwright visual regression" OR "playwright screenshots")
- API testing ("playwright request context" OR "playwright API testing")
- Accessibility testing ("playwright accessibility" OR "@axe-core/playwright")
- Component testing ("playwright component testing" OR "@playwright/experimental-ct")
- Mobile viewport testing patterns

Record which capabilities are commonly used together and which are specialized.

**Step 4: Update bibliography and commit**

```bash
git add research/raw/rounds/round-04-landscape research/raw/rounds/round-05-landscape research/raw/rounds/round-06-landscape research/sources.md
git commit -m "research: landscape rounds 4-6 — ecosystem mapping, CI/CD, specialized usage

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 3: Landscape Rounds 7-9 — Quality Tiers and Gold Standards

**Files:**
- Create: `research/raw/rounds/round-07-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-07-landscape/findings.md`
- Create: `research/raw/rounds/round-08-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-08-landscape/findings.md`
- Create: `research/raw/rounds/round-09-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-09-landscape/findings.md`
- Update: `research/sources.md`

**Step 1: Round 7 — Identify gold-standard suites for deep dives**

From all suites found in rounds 1-6, apply quality criteria:
- Test count and coverage breadth
- Active maintenance (commits in last 6 months)
- TypeScript usage with proper typing
- Presence of POM or fixture patterns
- CI/CD integration
- Documentation quality
- Community adoption (stars, forks, mentions)

Rank suites into tiers: Gold (deep dive candidates), Silver (pattern extraction), Bronze (reference only). Select 8-12 gold-standard candidates for deep analysis in later phases.

**Step 2: Round 8 — Analyze test stability and flakiness management**

For gold-standard candidates, search for:
- How they handle flaky tests (retry config, quarantine patterns)
- Test isolation strategies (database seeding, state cleanup)
- Timeout configurations and wait strategies
- How they avoid `page.waitForTimeout()` anti-patterns

Record stability patterns and anti-patterns.

**Step 3: Round 9 — Analyze test data and environment management**

For gold-standard candidates, look at:
- Test data strategies (factories, fixtures, seeds, API setup)
- Environment configuration (dotenv, env-specific configs)
- Base URL management
- Auth state management (storageState)
- Database setup/teardown patterns

Record data management patterns.

**Step 4: Update bibliography and commit**

```bash
git add research/raw/rounds/round-07-landscape research/raw/rounds/round-08-landscape research/raw/rounds/round-09-landscape research/sources.md
git commit -m "research: landscape rounds 7-9 — quality tiers, stability, data management

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 4: Landscape Rounds 10-12 — Synthesis Checkpoint

**Files:**
- Create: `research/raw/rounds/round-10-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-10-landscape/findings.md`
- Create: `research/raw/rounds/round-10-landscape/audit-notes.md`
- Create: `research/raw/rounds/round-11-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-11-landscape/findings.md`
- Create: `research/raw/rounds/round-12-landscape/suites-analyzed.md`
- Create: `research/raw/rounds/round-12-landscape/findings.md`
- Create: `research/raw/rounds/round-12-landscape/audit-notes.md`
- Update: `research/synthesis/structural-patterns.md` (initial population)
- Update: `research/synthesis/validation-patterns.md` (initial population)
- Update: `research/synthesis/semantic-patterns.md` (initial population)
- Update: `research/synthesis/rhetoric-patterns.md` (initial population)
- Update: `research/synthesis/performance-patterns.md` (initial population)
- Update: `research/synthesis/security-patterns.md` (initial population)

**Step 1: Rounds 10-11 — Fill landscape gaps**

Review all findings from rounds 1-9. Identify gaps:
- Missing project types or industries?
- Underrepresented capability areas (visual, a11y, mobile)?
- Missing framework combinations?
- Any key Playwright community projects not yet found?

Do targeted searches to fill gaps. Look specifically for:
- Enterprise-scale Playwright suites (100+ tests)
- Playwright suites in healthcare, fintech, e-commerce
- Playwright suites using advanced features (tracing, HAR recording, network mocking)

**Step 2: Round 12 — Write initial synthesis documents**

Populate all six synthesis files with initial patterns observed across the landscape:
- `structural-patterns.md` — Common file layouts, config approaches, POM variants
- `validation-patterns.md` — Assertion styles, retry strategies, wait patterns
- `semantic-patterns.md` — Naming conventions, test categorization, tag usage
- `rhetoric-patterns.md` — How suites describe their purpose (README, test descriptions)
- `performance-patterns.md` — Any performance testing patterns observed
- `security-patterns.md` — Any security testing patterns observed

**Step 3: Initialize standards documents with preliminary findings**

Write initial drafts of each standards document based on landscape observations. Mark everything as "preliminary — to be validated in phases 2-7."

**Step 4: Write audit notes**

Document in `audit-notes.md`:
- Total suites cataloged
- Quality tier distribution
- Stack distribution
- Gaps remaining
- Research threads to pursue in structure phase

**Step 5: Commit**

```bash
git add research/raw/rounds/round-10-landscape research/raw/rounds/round-11-landscape research/raw/rounds/round-12-landscape research/synthesis standards
git commit -m "research: landscape rounds 10-12 — synthesis checkpoint, initial patterns

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 5: Structure Rounds 13-16 — Deep Dive Suite Analyses

**Files:**
- Create: `research/raw/rounds/round-{13..16}-structure/suites-analyzed.md`
- Create: `research/raw/rounds/round-{13..16}-structure/findings.md`
- Create: `research/raw/suite-analyses/[project-name].md` (2-3 per round)
- Update: `research/synthesis/structural-patterns.md`
- Update: `research/synthesis/rhetoric-patterns.md`

**Step 1: Rounds 13-14 — Deep dive on 4-6 gold-standard suites**

Select 4-6 of the highest-quality suites identified in the landscape phase. For each, create a detailed analysis in `research/raw/suite-analyses/[project-name].md` covering:

**Architecture analysis:**
- Exact directory structure and file organization
- `playwright.config.ts` configuration analysis (projects, reporters, retries, workers)
- How tests are grouped (by feature, by page, by capability, by priority)
- Page Object Model implementation (if used) — class structure, method naming, inheritance
- Custom fixtures — what they encapsulate, how they compose
- Utility/helper organization
- Test data management approach
- Environment and base URL configuration

**Validation analysis:**
- Assertion patterns (which `expect` matchers are used most)
- Retry and timeout configuration
- How flaky tests are handled
- Test isolation strategy (beforeAll/beforeEach/afterAll patterns)
- API setup/teardown patterns

**CI/CD analysis:**
- Pipeline configuration (GitHub Actions, GitLab CI, etc.)
- Parallelism and sharding setup
- Reporter configuration for CI
- Artifact storage (traces, screenshots, videos)
- Environment variable management in CI

**Semantic analysis:**
- Test naming conventions (`test('should...', ...)` vs `test.describe`)
- File naming conventions
- How tests are tagged/annotated (`@smoke`, `@regression`, etc.)
- `test.describe` nesting depth and organization
- Test documentation patterns (comments, test descriptions)

**Step 2: Rounds 15-16 — Deep dive on 4-6 additional suites**

Select suites that contrast with those analyzed in 13-14:
- Different framework (if first batch was Next.js, pick Vue or Angular)
- Different test strategy (if first batch was POM-heavy, find fixture-heavy)
- Different scale (small focused suite vs. large comprehensive suite)
- Different industry/domain

Analyze using the same template. Note differences and similarities.

**Step 3: Update synthesis**

Update `structural-patterns.md` and `rhetoric-patterns.md` with confirmed patterns, noting frequency (e.g., "7/10 suites use this structure").

**Step 4: Commit**

```bash
git add research/raw/rounds/round-1{3,4,5,6}-structure research/raw/suite-analyses research/synthesis
git commit -m "research: structure rounds 13-16 — deep dives on suite architecture

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 6: Structure Rounds 17-20 — Config, Fixtures, and POM Patterns

**Files:**
- Create: `research/raw/rounds/round-{17..20}-structure/suites-analyzed.md`
- Create: `research/raw/rounds/round-{17..20}-structure/findings.md`
- Create: `research/raw/suite-analyses/[project-name].md` (1-2 per round)
- Update: `research/synthesis/structural-patterns.md`

**Step 1: Rounds 17-18 — Deep dive on Playwright configuration patterns**

Across all analyzed suites, do a focused extraction of `playwright.config.ts` patterns:
- Project definitions (chromium, firefox, webkit, mobile viewports)
- Reporter configurations (HTML, JSON, JUnit, custom)
- Retry strategies (global retries, per-project retries, CI vs local)
- Worker count and parallelism settings
- Timeout hierarchies (test, expect, navigation, action)
- `use` options (baseURL, storageState, trace, screenshot, video)
- Global setup/teardown scripts
- Test directory and test match patterns

Search for additional suites with interesting config approaches. Record patterns and anti-patterns.

**Step 2: Rounds 19-20 — Deep dive on fixtures and POM**

Focused extraction of custom fixture and POM patterns:
- Fixture composition (how fixtures extend base test)
- Fixture scoping (test vs worker scope)
- POM class structure (constructor, locator definitions, action methods, assertion methods)
- POM inheritance and composition patterns
- How POM handles dynamic content and waits
- Fixture factories and parameterized fixtures
- Auth fixture patterns (storageState reuse)

Search for suites with particularly innovative fixture or POM designs.

**Step 3: Update synthesis and commit**

```bash
git add research/raw/rounds/round-1{7,8,9}-structure research/raw/rounds/round-20-structure research/raw/suite-analyses research/synthesis
git commit -m "research: structure rounds 17-20 — config, fixtures, and POM patterns

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 7: Structure Rounds 21-22 — Pattern Consolidation and Standards Draft

**Files:**
- Create: `research/raw/rounds/round-{21,22}-structure/suites-analyzed.md`
- Create: `research/raw/rounds/round-{21,22}-structure/findings.md`
- Create: `research/raw/rounds/round-22-structure/audit-notes.md`
- Update: `standards/structure-standards.md`
- Update: `research/synthesis/structural-patterns.md`

**Step 1: Round 21 — Validation sweep on structure patterns**

For 10-15 suites not yet deep-dived, do quick structural scans:
- Record directory structure and config approach
- Note deviations from patterns found in deep dives
- Identify which patterns are universal vs. suite-specific

**Step 2: Round 22 — Finalize structure standards**

- Write the definitive `standards/structure-standards.md` with evidence citations
- Each claim must reference at least 2 suites that exemplify it
- Cover: file organization, config, POM, fixtures, test grouping, data management
- Mark remaining uncertainties for validation in later phases

**Step 3: Write audit notes and commit**

```bash
git add research/raw/rounds/round-2{1,2}-structure research/raw/suite-analyses research/synthesis standards
git commit -m "research: structure rounds 21-22 — finalize structure standards

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 8: Validation Rounds 23-26 — Assertion and Retry Deep Dives

**Files:**
- Create: `research/raw/rounds/round-{23..26}-validation/suites-analyzed.md`
- Create: `research/raw/rounds/round-{23..26}-validation/findings.md`
- Create: `research/raw/suite-analyses/[project-name].md` (1-2 per round)
- Update: `research/synthesis/validation-patterns.md`

**Step 1: Rounds 23-24 — Deep dive on assertion strategies**

Select 4-6 suites with the strongest test validation. For each, analyze:
- **Assertion patterns:** Which `expect` matchers are used (toBeVisible, toHaveText, toHaveURL, toContainText, etc.)
- **Custom matchers:** Any custom expect extensions
- **Soft assertions:** Use of `expect.soft()` for non-blocking checks
- **API assertions:** How API responses are validated
- **Visual assertions:** Screenshot comparison strategies (toHaveScreenshot, toMatchSnapshot)
- **Assertion granularity:** One assertion per test vs. multiple assertions
- **Error messages:** Custom failure messages

**Step 2: Rounds 25-26 — Deep dive on retry and flakiness management**

For the same suites plus additional ones:
- **Retry configuration:** Global vs. per-test retry counts
- **Flaky test handling:** Quarantine strategies, `test.fixme()`, `test.skip()` usage
- **Wait strategies:** `waitForSelector`, `waitForResponse`, `waitForURL`, `waitForLoadState`
- **Auto-waiting:** How suites leverage Playwright's built-in auto-waiting vs. explicit waits
- **Network interception:** `page.route()` for deterministic tests
- **Clock manipulation:** `page.clock` for time-dependent tests
- **Test timeouts:** How timeouts are set per-test vs. globally

**Step 3: Update validation synthesis and commit**

```bash
git add research/raw/rounds/round-2{3,4,5,6}-validation research/raw/suite-analyses research/synthesis
git commit -m "research: validation rounds 23-26 — assertion and retry deep dives

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 9: Validation Rounds 27-30 — CI/CD and Parallelism

**Files:**
- Create: `research/raw/rounds/round-{27..30}-validation/suites-analyzed.md`
- Create: `research/raw/rounds/round-{27..30}-validation/findings.md`
- Create: `research/raw/suite-analyses/[project-name].md` (1-2 per round)
- Update: `research/synthesis/validation-patterns.md`

**Step 1: Rounds 27-28 — Deep dive on CI/CD integration patterns**

Focus specifically on CI pipeline configurations:
- GitHub Actions workflow patterns for Playwright
- Docker-based Playwright execution (official containers)
- Sharding strategies (`--shard=N/M`)
- Parallel execution configurations
- CI-specific Playwright config overrides
- Artifact management (HTML reports, traces, screenshots, videos)
- Playwright reporter for CI (GitHub Actions reporter, JUnit XML)
- How suites handle CI vs. local differences
- Pull request check integration

**Step 2: Rounds 29-30 — Deep dive on test isolation and environment**

- How suites achieve test isolation (fresh contexts, storage state, API cleanup)
- Database seeding and teardown in CI
- Environment variable management
- Secrets handling for auth tests in CI
- Base URL configuration per environment (staging, preview, production)
- Global setup scripts for CI (database migration, seed data, start server)
- Playwright's `webServer` config usage

**Step 3: Update validation synthesis and commit**

```bash
git add research/raw/rounds/round-2{7,8,9}-validation research/raw/rounds/round-30-validation research/raw/suite-analyses research/synthesis
git commit -m "research: validation rounds 27-30 — CI/CD integration and test isolation

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 10: Validation Rounds 31-32 — Standards Finalization

**Files:**
- Create: `research/raw/rounds/round-{31,32}-validation/suites-analyzed.md`
- Create: `research/raw/rounds/round-{31,32}-validation/findings.md`
- Create: `research/raw/rounds/round-32-validation/audit-notes.md`
- Update: `standards/validation-standards.md`
- Update: `standards/cicd-standards.md`
- Update: `standards/quality-criteria.md` (begin populating)
- Update: `research/synthesis/validation-patterns.md`

**Step 1: Round 31 — Final validation sweep**

For 10+ suites not yet deeply analyzed:
- Quick scan of assertion patterns, retry config, CI setup
- Note deviations from established patterns
- Validate that patterns hold across diverse suites

**Step 2: Round 32 — Finalize validation and CI/CD standards**

- Write definitive `standards/validation-standards.md`
- Write definitive `standards/cicd-standards.md`
- Begin populating `standards/quality-criteria.md` with quality rubric
- Each standard must cite evidence from multiple suites

**Step 3: Audit and commit**

```bash
git add research/raw/rounds/round-3{1,2}-validation research/synthesis standards
git commit -m "research: validation rounds 31-32 — finalize validation and CI/CD standards

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 11: Performance Rounds 33-36 — Performance Testing Patterns

**Files:**
- Create: `research/raw/rounds/round-{33..36}-performance/suites-analyzed.md`
- Create: `research/raw/rounds/round-{33..36}-performance/findings.md`
- Create: `research/raw/suite-analyses/[project-name].md` (as needed)
- Update: `research/synthesis/performance-patterns.md`
- Update: `standards/performance-standards.md`

**Step 1: Rounds 33-34 — Search for Playwright performance testing patterns**

Search specifically for:
- "playwright performance testing" patterns and guides
- Suites using `page.metrics()` or Performance API
- Web Vitals measurement with Playwright (LCP, FID, CLS, INP)
- Lighthouse integration with Playwright
- Custom performance assertions (page load time thresholds)
- Network performance monitoring (response times, payload sizes)
- `page.route()` for performance simulation (slow 3G, offline)

Record which approaches the community uses and which are considered production-ready.

**Step 2: Rounds 35-36 — Deep dive and standards**

For suites with performance testing:
- Analyze how performance budgets are defined and enforced
- How performance tests differ from functional tests in structure
- Reporting and dashboarding of performance metrics
- How performance tests run in CI (separate pipeline? same pipeline?)
- Threshold management and alerting patterns

Write `standards/performance-standards.md` with evidence citations.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-3{3,4,5,6}-performance research/raw/suite-analyses research/synthesis standards
git commit -m "research: performance rounds 33-36 — performance testing patterns and standards

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 12: Security Rounds 37-40 — Security Testing Patterns

**Files:**
- Create: `research/raw/rounds/round-{37..40}-security/suites-analyzed.md`
- Create: `research/raw/rounds/round-{37..40}-security/findings.md`
- Create: `research/raw/rounds/round-40-security/audit-notes.md`
- Create: `research/raw/suite-analyses/[project-name].md` (as needed)
- Update: `research/synthesis/security-patterns.md`
- Update: `standards/security-standards.md`

**Step 1: Rounds 37-38 — Search for Playwright security testing patterns**

Search specifically for:
- "playwright security testing" patterns and guides
- Authentication flow testing (login, logout, session management, OAuth)
- Authorization testing (role-based access, permission boundaries)
- CSRF token validation testing
- XSS detection patterns with Playwright
- Content Security Policy (CSP) testing
- HTTP header security testing (HSTS, X-Frame-Options, etc.)
- Cookie security attribute testing (HttpOnly, Secure, SameSite)
- API security testing with Playwright request context

**Step 2: Rounds 39-40 — Deep dive and standards**

For suites with security testing:
- How auth state is managed across tests (storageState patterns)
- Multi-role testing strategies (admin, user, guest in same suite)
- How secrets are managed in test code
- Security regression testing patterns
- How suites test for broken access control
- Integration with security scanning tools

Write `standards/security-standards.md` with evidence citations.

Write audit notes for Performance + Security synthesis checkpoint.

**Step 3: Commit**

```bash
git add research/raw/rounds/round-3{7,8,9}-security research/raw/rounds/round-40-security research/raw/suite-analyses research/synthesis standards
git commit -m "research: security rounds 37-40 — security testing patterns and standards

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 13: Semantics Rounds 41-44 — Term Extraction and Naming Conventions

**Files:**
- Create: `research/raw/rounds/round-{41..44}-semantics/suites-analyzed.md`
- Create: `research/raw/rounds/round-{41..44}-semantics/findings.md`
- Update: `research/synthesis/semantic-patterns.md`
- Update: `glossary/playwright-glossary.md` (begin populating)

**Step 1: Rounds 41-42 — Extract Playwright-specific terminology**

Go through all previously analyzed suites and extract:
- Terms unique to Playwright testing ("locator", "fixture", "project", "worker", "shard")
- Test naming patterns (`test('should do X when Y')` vs `test('X: does Y')`)
- File naming conventions (kebab-case, camelCase, dot-notation like `login.spec.ts`)
- `test.describe` naming patterns (feature name, page name, user story)
- Tag/annotation conventions (`@smoke`, `@regression`, `@critical`, `@slow`)
- Test categorization vocabulary (smoke, sanity, regression, critical path, happy path, edge case)
- How suites distinguish E2E from integration from unit-level tests

For each term, record:
- Multiple usages from different suites
- Context of usage
- Related terms and distinctions

**Step 2: Rounds 43-44 — Validate terminology consistency**

Search specifically for:
- How different projects define the same concepts
- Whether terminology varies by framework ecosystem
- Which definitions have become standard in the Playwright community
- Playwright official documentation terminology vs. community usage
- Compare with Cypress/Selenium terminology for terms that carry over

Cross-reference with Playwright docs and community guides.

**Step 3: Begin building glossary**

Start populating `glossary/playwright-glossary.md` with entries for each term:
- Preferred definition (most common/consensus)
- Alternative definitions with suite citations
- Usage examples from real suites
- Related/contrasting terms

**Step 4: Commit**

```bash
git add research/raw/rounds/round-4{1,2,3,4}-semantics research/synthesis glossary
git commit -m "research: semantics rounds 41-44 — terminology extraction and glossary draft

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 14: Semantics Rounds 45-46 — Finalize Glossary and Conventions

**Files:**
- Create: `research/raw/rounds/round-{45,46}-semantics/suites-analyzed.md`
- Create: `research/raw/rounds/round-{45,46}-semantics/findings.md`
- Create: `research/raw/rounds/round-46-semantics/audit-notes.md`
- Update: `standards/semantic-conventions.md`
- Update: `glossary/playwright-glossary.md`
- Update: `research/synthesis/semantic-patterns.md`

**Step 1: Rounds 45-46 — Final semantic sweep and standards**

- Validate glossary entries against 10+ fresh suites
- Write definitive `standards/semantic-conventions.md` covering:
  - Required naming patterns (files, tests, describes, POM classes)
  - Recommended terminology (preferred terms and why)
  - Common pitfalls (terms often misused or ambiguously applied)
  - Tag/annotation conventions
  - Test categorization taxonomy

**Step 2: Audit and commit**

```bash
git add research/raw/rounds/round-4{5,6}-semantics research/synthesis standards glossary
git commit -m "research: semantics rounds 45-46 — finalize glossary and semantic conventions

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 15: Cross-Validation Rounds 47-50 — Audit All Standards

**Files:**
- Create: `research/raw/rounds/round-{47..50}-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-{47..50}-crossval/findings.md`
- Create: `research/raw/rounds/round-{47..50}-crossval/audit-notes.md`
- Update: All `standards/` files as needed
- Update: All `research/synthesis/` files as needed

**Step 1: Round 47 — Fresh suite test**

Find 5-10 Playwright suites NOT yet analyzed (preferably recent, active projects). Apply all current standards as a rubric:
- Does structure standards predict their file organization?
- Does validation standards match their assertion/retry patterns?
- Does the glossary cover their terminology?
- Does semantic conventions match their naming?
- Does CI/CD standards match their pipeline?

Record where standards are confirmed and where they fail.

**Step 2: Round 48 — Cross-domain validation**

Find Playwright suites from domains not yet covered:
- Mobile-first applications
- SaaS dashboards
- Developer tools
- Content management systems
- E-commerce platforms

Do standards generalize across domains? What domain-specific adaptations are needed?

**Step 3: Round 49 — Scale validation**

Compare standards against suites of different scales:
- Small suites (10-30 tests)
- Medium suites (30-100 tests)
- Large suites (100+ tests)
- Monorepo suites (multiple apps, shared fixtures)

Do standards scale? What advice is scale-dependent?

**Step 4: Round 50 — Negative case analysis**

Find lower-quality or abandoned Playwright suites:
- What do they lack that the standards would catch?
- Does the checklist flag their weaknesses?
- Validate that standards distinguish quality levels

**Step 5: Revise standards and commit**

```bash
git add research/raw/rounds/round-4{7,8,9}-crossval research/raw/rounds/round-50-crossval research/synthesis standards glossary
git commit -m "research: cross-validation rounds 47-50 — audit all standards against fresh suites

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 16: Cross-Validation Rounds 51-55 — Final Synthesis

**Files:**
- Create: `research/raw/rounds/round-{51..55}-crossval/suites-analyzed.md`
- Create: `research/raw/rounds/round-{51..55}-crossval/findings.md`
- Create: `research/raw/rounds/round-55-crossval/audit-notes.md`
- Update: All `standards/` files (final versions)
- Update: `standards/quality-criteria.md` (finalize)
- Update: All `research/synthesis/` files (final versions)

**Step 1: Rounds 51-52 — Resolve contradictions**

Review all audit notes from all phases. For any unresolved contradictions:
- Do targeted research to resolve
- If genuinely contested, document both positions in the standard

**Step 2: Round 53 — Finalize quality criteria**

Complete `standards/quality-criteria.md`:
- Synthesize all dimensions into a unified quality rubric
- Weight criteria by importance
- Include concrete examples at each quality level (gold, silver, bronze)
- Make the rubric usable as both a creation guide and an audit tool

**Step 3: Rounds 54-55 — Final consistency pass**

Read all standards documents end-to-end. Ensure:
- No contradictions between documents
- Consistent terminology (matches glossary)
- All claims have evidence citations
- Cross-references between documents are accurate

**Step 4: Commit**

```bash
git add research/raw/rounds/round-5{1,2,3,4,5}-crossval research/synthesis standards
git commit -m "research: cross-validation rounds 51-55 — final synthesis and quality criteria

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 17: Assemble Templates and Checklist

**Files:**
- Create: `templates/suite-template/playwright.config.ts` (template)
- Create: `templates/suite-template/tests/example.spec.ts` (template)
- Create: `templates/suite-template/tests/fixtures/index.ts` (template)
- Create: `templates/suite-template/tests/pages/example.page.ts` (template)
- Create: `templates/suite-template/README.md`
- Create: `templates/section-guides/config-guide.md`
- Create: `templates/section-guides/pom-guide.md`
- Create: `templates/section-guides/fixtures-guide.md`
- Create: `templates/section-guides/assertions-guide.md`
- Create: `templates/section-guides/cicd-guide.md`
- Create: `templates/section-guides/data-management-guide.md`
- Create: `templates/section-guides/performance-guide.md`
- Create: `templates/section-guides/security-guide.md`
- Update: `checklist/pre-creation-checklist.md`

**Step 1: Write suite template**

Based on `standards/structure-standards.md`, create a TypeScript Playwright suite scaffold that includes:
- `playwright.config.ts` with production-grade defaults
- Example test file demonstrating naming and assertion patterns
- Example POM class demonstrating the standard pattern
- Example fixtures demonstrating composition
- README explaining how to use and adapt the template

**Step 2: Write section guides**

For each concern, create a guide in `templates/section-guides/` that includes:
- Purpose and goals
- Common patterns from the analysis (with examples)
- Pitfalls to avoid
- Connection to standards

**Step 3: Write pre-creation checklist**

Derive actionable yes/no items from all standards documents. Organize by:
1. **Structure checklist** — from structure standards
2. **Validation checklist** — from validation standards
3. **CI/CD checklist** — from CI/CD standards
4. **Naming checklist** — from semantic conventions
5. **Performance checklist** — from performance standards
6. **Security checklist** — from security standards
7. **Overall quality checklist** — from quality criteria

Each item: yes/no question, actionable, linked to its source standard.

**Step 4: Commit**

```bash
git add templates checklist
git commit -m "deliverable: suite template, section guides, and pre-creation checklist

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```

---

### Task 18: Gap Analysis, README, and CLAUDE.md Update

**Files:**
- Create: `research/raw/rounds/round-56+-gap/findings.md` (if additional rounds needed)
- Update: `README.md`
- Update: `CLAUDE.md`
- Update: Any standards/deliverables as needed

**Step 1: Evaluate coverage**

Review all deliverables against success criteria:
- Are all standards grounded in evidence from 30+ suites?
- Do standards cover the full Playwright capability spectrum?
- Does the glossary have consensus definitions?
- Does the checklist catch weaknesses in real suites?
- Is the template usable?
- Are all artifacts Markdown, readable by Claude Code?

**Step 2: Execute additional rounds if needed**

For any gaps identified, do targeted research rounds following the same per-round process.

**Step 3: Update README**

Write a comprehensive README.md that explains:
- What this repository contains
- How to use each deliverable
- Summary statistics (number of suites analyzed, rounds completed)
- How to contribute

**Step 4: Update CLAUDE.md**

Update CLAUDE.md with any new conventions or workflows discovered during the research process.

**Step 5: Final consistency check**

Read every deliverable end-to-end. Ensure all cross-references work, glossary terms match, checklist items map to standards, template follows standards.

**Step 6: Final commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: finalize README and CLAUDE.md with research outcomes

Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>"
```
