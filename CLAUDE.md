# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Research and documentation project that distills standards from high-quality production-grade Playwright automation suites. Analyzed 40+ real-world open-source projects across 97 research rounds to produce actionable reference documents: standards, a suite template, a quality checklist, and a glossary.

**Status:** Phase 1 (rounds 1-55) and Phase 2 (rounds 56-97) complete. All deliverables finalized and cross-validated.

## Research Methodology

This project followed a **Topic-Layered Spiral** approach across two phases:
- **Phase 1 (rounds 1-55):** 7 topic phases (landscape, structure, validation, performance, security, semantics, cross-validation)
- **Phase 2 (rounds 56-97):** 5 phases (shared landscape, deep dives, drafting, cross-validation, deliverables) covering test anatomy, coverage strategy, and scaling organization

Each round followed a **research, extract, distill, validate, update** cycle. Audit checkpoints at rounds 10, 12, 22, 32, 40, 46, 47, 50, 55, 63, 75, 83, 91, and 97 triggered re-evaluation of earlier findings.

Raw research is separated from synthesis. All artifacts are Markdown, readable by Claude Code.

## Repository Structure

```
standards/                             # 9 finalized standards documents
  structure-standards.md               #   S1-S12: File org, config, POM, fixtures, grouping, data, scaling
  validation-standards.md              #   V1-V6: Assertions, retry, waits, flakiness, network, isolation
  cicd-standards.md                    #   C1-C7: Pipeline, sharding, Docker, reporters, artifacts, env
  performance-standards.md             #   P1-P7: App perf, load, budgets, structure, CI perf
  security-standards.md                #   SEC1-SEC7: Auth, credentials, RBAC, sessions, validation, scanning
  semantic-conventions.md              #   N1-N8: Naming, tags, categorization, data attributes
  quality-criteria.md                  #   Q1-Q7: Tiers, dimensions, maturity, flakiness, rubrics (9-domain)
  test-anatomy-standards.md            #   TA1-TA6: AAA, single responsibility, steps, setup, assertions
  coverage-standards.md                #   COV1-COV5: E2E boundaries, tiers, prioritization, measurement

templates/
  suite-template/                      # Production-ready Playwright suite scaffold
    .github/workflows/playwright.yml   #   CI workflow with sharding
    tests/                             #   Example test, fixtures, page objects
    playwright.config.ts               #   Reference configuration
    package.json                       #   Dependencies
    README.md                          #   Template usage guide
  section-guides/                      # 11 implementation guides
    config-guide.md
    fixtures-guide.md
    pom-guide.md
    assertions-guide.md
    data-management-guide.md
    cicd-guide.md
    performance-guide.md
    security-guide.md
    test-anatomy-guide.md              #   Phase 2: test structure and anatomy
    coverage-guide.md                  #   Phase 2: coverage strategy
    scaling-guide.md                   #   Phase 2: scaling organization

checklist/
  pre-creation-checklist.md            # 220+ item quality checklist (maps to standard IDs)

glossary/
  playwright-glossary.md               # 50-term glossary with alternatives

research/
  sources.md                           # Master bibliography (180+ entries)
  raw/rounds/round-NN-phase/           # 97 research round directories
    findings.md                        #   Round findings
    suites-analyzed.md                 #   Suites studied in this round
    audit-notes.md                     #   (audit rounds only)
  raw/suite-analyses/                  # 12 deep-dive suite analyses
  synthesis/                           # 8 cross-round pattern files
    structural-patterns.md
    validation-patterns.md
    performance-patterns.md
    security-patterns.md
    semantic-patterns.md
    rhetoric-patterns.md
    anatomy-patterns.md                #   Phase 2: test anatomy patterns
    coverage-patterns.md               #   Phase 2: coverage strategy patterns

docs/plans/                            # Research design and execution plan
```

## Key Conventions

- **Standards format:** Each standard has an ID (e.g., `S1.1`, `V2.3`, `C4.1`, `TA1.1`, `COV2.3`), a recommendation, rationale, evidence with suite citations, valid alternatives, and anti-patterns
- **Checklist items** reference standard IDs in brackets (e.g., `[S1.1]`) for traceability
- **Glossary terms** include definitions, context, code examples, alternatives from other frameworks, and evidence
- **Quality tiers:** Gold (10 suites), Silver (12 suites), Bronze (33 suites/resources) -- Gold-tier suites are the primary evidence base
- **Round artifacts:** Each round gets its own directory under `research/raw/rounds/` named `round-NN-phase/` containing `findings.md` and `suites-analyzed.md`
- **Suite analyses:** Deep dives on individual suites are in `research/raw/suite-analyses/[project-name].md`
- **Sources:** Master bibliography lives in `research/sources.md`
- **Synthesis files** consolidate patterns across rounds; **standards files** are the finalized deliverables
- All claims in standards documents cite evidence from analyzed suites

## Git

- Every commit MUST include `Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>`
- Do NOT add a Claude co-authored-by line
- Commit messages follow the pattern: `research: <phase> rounds N-M -- <description>` for research commits; `docs: <description>` for documentation updates

## Working With This Repo

- When updating standards, always verify evidence citations still hold by checking the referenced suite analysis
- When adding new research rounds, update `research/sources.md` with new projects analyzed
- Checklist items must map to a specific standard ID -- never add a checklist item without a backing standard
- Cross-reference accuracy target: 93%+ (achieved in Phase 1 rounds 47-55 and Phase 2 rounds 82-91 at 94%)
