# Playwright Automation Standards

Evidence-based standards for building production-grade Playwright test suites. Distilled from 55 research rounds analyzing 30+ real-world open-source projects and 120+ sources.

## What This Repository Contains

This project delivers five interconnected reference artifacts:

| Artifact | Location | Purpose |
|---|---|---|
| **Standards** | `standards/` | 7 finalized standards documents covering structure, validation, CI/CD, performance, security, semantic conventions, and quality criteria |
| **Template** | `templates/suite-template/` | A production-ready Playwright suite scaffold with config, CI workflow, fixtures, and POM |
| **Section Guides** | `templates/section-guides/` | 8 detailed implementation guides for each template component |
| **Checklist** | `checklist/pre-creation-checklist.md` | 178-item quality checklist for creating or auditing Playwright suites |
| **Glossary** | `glossary/playwright-glossary.md` | 38-term glossary with consensus definitions and alternative usages |

## Summary Statistics

| Metric | Count |
|---|---|
| Research rounds completed | 55 |
| Research phases | 7 (landscape, structure, validation, performance, security, semantics, cross-validation) |
| Suites deep-dived | 12 |
| Total sources analyzed | 120+ |
| Bibliography entries | 155 |
| Standards documents | 7 |
| Individual standards (subsections) | 194 |
| Checklist items | 178 |
| Glossary terms | 38 |
| Section guides | 8 |
| Audit checkpoints | 6 (rounds 10, 12, 22, 32, 40, 46, 47, 50, 55) |
| Cross-validation accuracy | 93-97% across all standards |

## How to Use Each Deliverable

### Standards (`standards/`)

The standards are the core output. Each document follows a consistent format: standard ID, recommendation, rationale, evidence (with suite citations), valid alternatives, and anti-patterns.

| Document | Covers |
|---|---|
| `structure-standards.md` | File organization, configuration, POM, fixtures, test grouping, data management |
| `validation-standards.md` | Web-first assertions, retry/timeout, wait strategies, flakiness, network determinism, isolation |
| `cicd-standards.md` | Pipeline structure, sharding, Docker, reporters, artifacts, environment management |
| `performance-standards.md` | App performance testing, load testing, budgets, test structure, CI architecture |
| `security-standards.md` | Auth testing, credentials, RBAC, sessions, security validation, scanning integration |
| `semantic-conventions.md` | File naming, test naming, POM naming, fixture naming, tags, categorization |
| `quality-criteria.md` | Quality tiers (Gold/Silver/Bronze), evaluation dimensions, maturity model, flakiness gates |

**How to use:** Read the relevant standards document before designing a new suite or auditing an existing one. Each standard has an ID (e.g., `S1.1`, `V2.3`, `C4.1`) that cross-references to the checklist.

### Template (`templates/suite-template/`)

A copy-and-customize scaffold that implements the standards. Contains:

- `playwright.config.ts` -- Production-ready config with CI/local differentiation, setup projects, multi-reporter, and timeout hierarchy
- `.github/workflows/playwright.yml` -- GitHub Actions CI workflow with sharding, artifact upload, and report merging
- `tests/fixtures/index.ts` -- Custom fixture setup using `test.extend<T>()`
- `tests/pages/example.page.ts` -- Page Object Model example with readonly locators
- `tests/example.spec.ts` -- Example test demonstrating best practices

**How to use:** Copy `templates/suite-template/` to your project root, rename it, and customize. Read the section guides for detailed implementation guidance on each component.

### Section Guides (`templates/section-guides/`)

Deep-dive guides for implementing each aspect of the template:

| Guide | Covers |
|---|---|
| `config-guide.md` | Playwright configuration patterns and options |
| `fixtures-guide.md` | Custom fixtures with `test.extend<T>()` |
| `pom-guide.md` | Page Object Model implementation |
| `assertions-guide.md` | Web-first assertions and custom matchers |
| `data-management-guide.md` | Test data factories and API-first setup |
| `cicd-guide.md` | CI/CD pipeline configuration |
| `performance-guide.md` | Performance testing integration |
| `security-guide.md` | Security testing patterns |

**How to use:** Reference the relevant guide when implementing a specific component. Each guide includes code examples, patterns from Gold-tier suites, and common pitfalls.

### Checklist (`checklist/pre-creation-checklist.md`)

A 178-item yes/no checklist organized into 7 sections that map directly to the standards:

1. **Structure Checklist** -- File organization, configuration, POM, fixtures, data management
2. **Validation Checklist** -- Assertions, retries, waits, flakiness, network, isolation
3. **CI/CD Checklist** -- Pipeline, sharding, Docker, reporters, artifacts
4. **Naming Checklist** -- File naming, test naming, POM naming, tags
5. **Performance Checklist** -- Performance testing, budgets, CI performance
6. **Security Checklist** -- Auth, credentials, RBAC, sessions, scanning
7. **Quality Checklist** -- Quality tiers, maturity, flakiness gates

**How to use:** Walk through the checklist before creating a new suite (to plan) or when auditing an existing suite (to identify gaps). Every item references a specific standard ID (e.g., `[S1.1]`, `[V2.3]`).

### Glossary (`glossary/playwright-glossary.md`)

38 Playwright-specific and testing terms with:

- Precise definitions grounded in Playwright v1.50 API
- Context explaining when and how the term is used
- Code examples
- Alternative terminology from other frameworks (Cypress, Selenium, WebDriver)
- Evidence from analyzed suites

**How to use:** Reference when writing standards-compliant tests, onboarding team members, or resolving terminology ambiguity. Covers core API terms, test runner concepts, assertion patterns, POM terminology, and test categorization.

## Repository Structure

```
playwright-automation-standards/
├── CLAUDE.md                          # Claude Code guidance
├── README.md                          # This file
├── prompt.md                          # Original project prompt
│
├── standards/                         # Finalized standards documents
│   ├── structure-standards.md         #   S1-S6: File org, config, POM, fixtures, grouping, data
│   ├── validation-standards.md        #   V1-V6: Assertions, retry, waits, flakiness, network, isolation
│   ├── cicd-standards.md              #   C1-C7: Pipeline, sharding, Docker, reporters, artifacts, env
│   ├── performance-standards.md       #   P1-P7: App perf, load, budgets, structure, CI perf
│   ├── security-standards.md          #   SEC1-SEC7: Auth, credentials, RBAC, sessions, validation, scanning
│   ├── semantic-conventions.md        #   N1-N8: Naming, tags, categorization, data attributes
│   └── quality-criteria.md            #   Q1-Q7: Tiers, dimensions, maturity, flakiness, rubrics
│
├── templates/
│   ├── suite-template/                # Production-ready Playwright suite scaffold
│   │   ├── .github/workflows/         #   CI workflow
│   │   ├── tests/                     #   Example tests, fixtures, page objects
│   │   ├── playwright.config.ts       #   Reference configuration
│   │   ├── package.json               #   Dependencies
│   │   └── README.md                  #   Template usage guide
│   └── section-guides/               # Implementation guides (8 guides)
│       ├── config-guide.md
│       ├── fixtures-guide.md
│       ├── pom-guide.md
│       ├── assertions-guide.md
│       ├── data-management-guide.md
│       ├── cicd-guide.md
│       ├── performance-guide.md
│       └── security-guide.md
│
├── checklist/
│   └── pre-creation-checklist.md      # 178-item quality checklist
│
├── glossary/
│   └── playwright-glossary.md         # 38-term reference glossary
│
├── research/
│   ├── sources.md                     # Master bibliography (155 entries)
│   ├── raw/
│   │   ├── rounds/                    # 55 research round directories
│   │   │   ├── round-01-landscape/    #   Each contains findings.md + suites-analyzed.md
│   │   │   ├── ...                    #   Audit rounds also contain audit-notes.md
│   │   │   └── round-55-crossval/
│   │   └── suite-analyses/            # 12 deep-dive suite analyses
│   │       ├── affine.md
│   │       ├── calcom.md
│   │       ├── excalidraw.md
│   │       ├── freecodecamp.md
│   │       ├── grafana.md
│   │       ├── grafana-plugin-tools.md
│   │       ├── immich.md
│   │       ├── playwright.md
│   │       ├── slate.md
│   │       ├── supabase.md
│   │       ├── clerk-e2e-template.md
│   │       └── playwright-ts-template.md
│   └── synthesis/                     # Cross-round pattern consolidation
│       ├── structural-patterns.md
│       ├── validation-patterns.md
│       ├── performance-patterns.md
│       ├── security-patterns.md
│       ├── semantic-patterns.md
│       └── rhetoric-patterns.md
│
└── docs/
    └── plans/                         # Research design and execution plan
        ├── 2026-03-18-playwright-research-design.md
        └── 2026-03-18-playwright-research-execution-plan.md
```

## Research Methodology

This project followed a **Topic-Layered Spiral** approach:

1. **Landscape** (Rounds 1-12): Discovered and categorized 55+ Playwright suites into Gold/Silver/Bronze tiers
2. **Structure** (Rounds 13-22): Deep-dived file organization, configuration, POM, and fixture patterns
3. **Validation** (Rounds 23-32): Analyzed assertion strategies, retry logic, CI/CD pipelines, and flakiness management
4. **Performance** (Rounds 33-36): Studied performance testing integration (Lighthouse, CDP, Artillery)
5. **Security** (Rounds 37-40): Investigated auth testing, credential management, RBAC, and DAST scanning
6. **Semantics** (Rounds 41-46): Extracted naming conventions, tag taxonomies, and built the glossary
7. **Cross-Validation** (Rounds 47-55): Audited all standards against 17 new suites; final accuracy 93-97%

Each round followed a **research, extract, distill, validate, update** cycle. Audit checkpoints triggered re-evaluation of earlier findings against new evidence.

## Analyzed Projects (Gold Tier)

These production-grade suites formed the primary evidence base:

| Project | Stars | Key Patterns |
|---|---|---|
| [microsoft/playwright](https://github.com/microsoft/playwright) | ~84,500 | Canonical self-tests; every API surface |
| [calcom/cal.com](https://github.com/calcom/cal.com) | ~38,700 | Monorepo; CI sharding; fixture-based auth |
| [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) | ~435,000 | Cypress-to-Playwright migration; contributor docs |
| [grafana/grafana](https://github.com/grafana/grafana) | ~72,700 | Observability platform; advanced fixtures |
| [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) | ~66,100 | Multi-platform (web, desktop, mobile); 5-shard CI |
| [immich-app/immich](https://github.com/immich-app/immich) | ~90,000 | Docker-based E2E; log capture |
| [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) | ~118,900 | Accessibility testing with axe-core |
| [ianstormtaylor/slate](https://github.com/ianstormtaylor/slate) | ~30,800 | Rich text editor; cross-browser testing |
| [supabase/supabase](https://github.com/supabase/supabase) | ~99,000 | Auth session handling; setup projects |
| [vercel/next.js](https://github.com/vercel/next.js) | ~132,000 | Framework with official Playwright template |

See `research/sources.md` for the complete bibliography of 155 sources.

## Contributing and Feedback

These standards represent patterns observed across production Playwright suites as of March 2026. To provide feedback or suggest updates:

1. **Report inaccuracies:** If a standard contradicts your production experience, open an issue with evidence
2. **Suggest additions:** New patterns should be backed by evidence from 2+ production suites
3. **Update evidence:** As Playwright evolves, standards may need revision -- cite the relevant Playwright version

## License

This repository contains research documentation and standards. The analyzed projects retain their original licenses.
