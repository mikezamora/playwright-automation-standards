# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Research and documentation project that distills standards from high-quality production-grade Playwright automation suites. Analyzed 30+ real-world open-source projects across 55 research rounds to produce actionable reference documents: standards, a suite template, a quality checklist, and a glossary.

**Status:** Research complete. All deliverables finalized and cross-validated.

## Research Methodology

This project followed a **Topic-Layered Spiral** approach: 55 rounds grouped into 7 phases (landscape, structure, validation, performance, security, semantics, cross-validation). Each round followed a **research, extract, distill, validate, update** cycle. Audit checkpoints at rounds 10, 12, 22, 32, 40, 46, 47, 50, and 55 triggered re-evaluation of earlier findings.

Raw research is separated from synthesis. All artifacts are Markdown, readable by Claude Code.

## Repository Structure

```
standards/                             # 7 finalized standards documents
  structure-standards.md               #   S1-S6: File org, config, POM, fixtures, grouping, data
  validation-standards.md              #   V1-V6: Assertions, retry, waits, flakiness, network, isolation
  cicd-standards.md                    #   C1-C7: Pipeline, sharding, Docker, reporters, artifacts, env
  performance-standards.md             #   P1-P7: App perf, load, budgets, structure, CI perf
  security-standards.md                #   SEC1-SEC7: Auth, credentials, RBAC, sessions, validation, scanning
  semantic-conventions.md              #   N1-N8: Naming, tags, categorization, data attributes
  quality-criteria.md                  #   Q1-Q7: Tiers, dimensions, maturity, flakiness, rubrics

templates/
  suite-template/                      # Production-ready Playwright suite scaffold
    .github/workflows/playwright.yml   #   CI workflow with sharding
    tests/                             #   Example test, fixtures, page objects
    playwright.config.ts               #   Reference configuration
    package.json                       #   Dependencies
    README.md                          #   Template usage guide
  section-guides/                      # 8 implementation guides
    config-guide.md
    fixtures-guide.md
    pom-guide.md
    assertions-guide.md
    data-management-guide.md
    cicd-guide.md
    performance-guide.md
    security-guide.md

checklist/
  pre-creation-checklist.md            # 178-item quality checklist (maps to standard IDs)

glossary/
  playwright-glossary.md               # 38-term glossary with alternatives

research/
  sources.md                           # Master bibliography (155 entries)
  raw/rounds/round-NN-phase/           # 55 research round directories
    findings.md                        #   Round findings
    suites-analyzed.md                 #   Suites studied in this round
    audit-notes.md                     #   (audit rounds only)
  raw/suite-analyses/                  # 12 deep-dive suite analyses
  synthesis/                           # 6 cross-round pattern files
    structural-patterns.md
    validation-patterns.md
    performance-patterns.md
    security-patterns.md
    semantic-patterns.md
    rhetoric-patterns.md

docs/plans/                            # Research design and execution plan
```

## Key Conventions

- **Standards format:** Each standard has an ID (e.g., `S1.1`, `V2.3`, `C4.1`), a recommendation, rationale, evidence with suite citations, valid alternatives, and anti-patterns
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
- Cross-reference accuracy target: 93%+ (achieved in cross-validation rounds 47-55)
