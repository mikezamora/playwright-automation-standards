# Playwright Automation Standards — Research Design

> **Approved:** 2026-03-18
> **Methodology:** Source-First Spiral (adapted from PCN Publication Standards project)
> **Minimum rounds:** 55+, re-evaluate at round 55

---

## Goal

Distill standards from high-quality production-grade Playwright automation suites into actionable reference documents. The deliverables must enable:

1. **Building** a production-grade Playwright suite from scratch
2. **Auditing** an existing suite against community standards
3. **Contributing** to the Playwright ecosystem as a published community resource

## Audience

- QA/Test engineers writing and maintaining Playwright suites
- Engineering teams adopting Playwright from scratch
- AI coding agents (Claude Code) generating Playwright suites autonomously

## Scope

Full spectrum of Playwright capabilities:
- End-to-end browser testing
- API testing
- Visual regression testing
- Accessibility testing
- Performance testing
- Security testing
- Component testing
- Mobile web testing

**Stack focus:** TypeScript-first, framework-agnostic. When framework-specific examples are needed, prefer NextJS/React (UI) and NestJS (API).

---

## Research Architecture: Source-First Spiral

Adapted from the PCN Publication Standards project's Topic-Layered Spiral. Each round follows:

```
research → extract → distill → validate → update
```

Raw research is separated from synthesis. All artifacts are Markdown, readable by Claude Code.

### Phase Structure

| Phase | Rounds | Dimension | What We're Extracting |
|-------|--------|-----------|----------------------|
| **Landscape** | 1-12 | Discovery & Cataloging | Suite discovery, quality tiers, stack analysis, ecosystem mapping |
| **Structure** | 13-22 | Architecture & Organization | File layout, configs, POM/fixtures, test grouping, data management |
| **Validation** | 23-32 | Testing Philosophy & CI/CD | Assertions, retries, flakiness, parallelism, CI pipelines, reporting |
| **Performance** | 33-36 | Performance & Load Testing | Performance testing patterns, metrics collection, threshold strategies |
| **Security** | 37-40 | Security Testing | Auth flows, CSRF/XSS detection, security-focused test patterns |
| **Semantics** | 41-46 | Naming & Terminology | Naming conventions, tags/annotations, categorization, community vocabulary |
| **Synthesis** | 47-55+ | Cross-Validation & Finalization | Audit all findings, resolve contradictions, finalize standards, templates, checklists |

### Synthesis Checkpoints

Audit previous work against new findings at these gates:
- Round 12: End of Landscape — initial synthesis documents
- Round 22: End of Structure — validate structural patterns
- Round 32: End of Validation — validate testing philosophy
- Round 40: End of Performance + Security — validate specialized patterns
- Round 46: End of Semantics — validate terminology
- Round 55+: Final synthesis — resolve contradictions, finalize everything

---

## Artifact Structure

```
research/
├── raw/
│   ├── rounds/
│   │   ├── round-01-landscape/
│   │   │   ├── suites-analyzed.md
│   │   │   └── findings.md
│   │   └── ...
│   └── suite-analyses/
│       ├── [project-name].md
│       └── ...
├── synthesis/
│   ├── structural-patterns.md
│   ├── validation-patterns.md
│   ├── semantic-patterns.md
│   ├── rhetoric-patterns.md
│   ├── performance-patterns.md
│   └── security-patterns.md
└── sources.md
```

### Source Citation Format

Master bibliography in `research/sources.md`:

| Citation Key | Project | Stars | URL | Stack | Last Active | Notes |
|---|---|---|---|---|---|---|
| `calcom-e2e` | Cal.com | 25k+ | github.com/... | TS/Next.js | 2026-03 | Full E2E suite with POM |

### Per-Round Artifacts

**suites-analyzed.md:** Which repos/suites were examined this round, with links and metadata.

**findings.md:** 5-8 numbered key findings per round, each with:
- Concise narrative (1-2 paragraphs)
- Evidence citations linking to specific repos/files
- Research threads for follow-up in subsequent rounds

### Suite Analysis Format (Deep Dives)

Each file in `research/raw/suite-analyses/[project-name].md`:

1. **Architecture Analysis** — file structure, config, fixtures, POM implementation
2. **Validation Analysis** — assertion patterns, retry strategies, test isolation
3. **CI/CD Analysis** — pipeline config, parallelism, reporting
4. **Semantic Analysis** — naming conventions, test categorization, documentation
5. **Key Patterns** — synthesized bullets of what makes this suite notable

---

## Deliverables

| Deliverable | Path | Purpose |
|---|---|---|
| Structure Standards | `standards/structure-standards.md` | How to organize a Playwright suite |
| Validation Standards | `standards/validation-standards.md` | Assertion, retry, flakiness management |
| Semantic Conventions | `standards/semantic-conventions.md` | Naming, tagging, categorization |
| CI/CD Standards | `standards/cicd-standards.md` | Pipeline integration patterns |
| Performance Standards | `standards/performance-standards.md` | Performance testing patterns |
| Security Standards | `standards/security-standards.md` | Security testing patterns |
| Quality Criteria | `standards/quality-criteria.md` | Unified quality rubric |
| Suite Template | `templates/suite-template/` | Scaffold for a new production suite |
| Section Guides | `templates/section-guides/` | Per-concern implementation guides |
| Pre-Creation Checklist | `checklist/pre-creation-checklist.md` | Yes/no items before shipping a suite |
| Glossary | `glossary/playwright-glossary.md` | Community terminology with definitions |

**Evidence requirement:** Every claim in standards documents must cite 2+ analyzed suites.

---

## Success Criteria

1. Standards are grounded in evidence from 30+ analyzed real-world suites
2. Standards cover the full Playwright capability spectrum (E2E, API, visual, a11y, perf, security, component, mobile)
3. Glossary has consensus definitions with alternative usages noted
4. Checklist reliably identifies gaps in both new and existing suites
5. Template produces a suite structure that matches the quality of analyzed gold-standard examples
6. All artifacts are Markdown, readable by Claude Code for autonomous suite generation
