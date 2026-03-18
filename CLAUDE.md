# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Research and documentation project that distills standards from high-quality production-grade Playwright automation suites. The goal is to analyze real-world open-source projects, extract patterns for structure, semantics, validation philosophy, and techniques, and produce actionable reference documents.

## Research Methodology

This project follows a **Topic-Layered Spiral** approach: rounds grouped by dimension (landscape → structure → validation → semantics → synthesis), each round follows a **research → extract → distill → validate → update** cycle. Minimum 40+ rounds with re-evaluation checkpoints.

Raw research is separated from synthesis. All artifacts are Markdown, readable by Claude Code.

## Repository Structure

```
research/raw/rounds/          # Per-round research findings
research/raw/suite-analyses/  # Deep dives on individual Playwright suites
research/synthesis/           # Cross-round pattern consolidation
standards/                    # Finalized standards documents
templates/                    # Reusable suite templates
checklist/                    # Pre-creation quality checklists
glossary/                     # Playwright automation glossary
```

## Key Conventions

- **Round artifacts**: Each round gets its own directory under `research/raw/rounds/` named `round-NN-phase/` containing `suites-analyzed.md` and `findings.md`
- **Suite analyses**: Deep dives on individual suites go in `research/raw/suite-analyses/[project-name].md`
- **Sources**: Master bibliography of all analyzed projects lives in `research/sources.md`
- **Synthesis files** consolidate patterns across rounds; **standards files** are the finalized deliverables
- Commit messages follow the pattern: `research: <phase> rounds N-M — <description>`
- All claims in standards documents must cite evidence from analyzed suites

## Git

- Every commit MUST include `Co-Authored-By: Mike-Zamora-Lendbuzz <michael.zamora@lendbuzz.com>`
- Do NOT add a Claude co-authored-by line

## Working With This Repo

- Use `superpowers-extended-cc:executing-plans` for task-by-task execution of the research plan
- When adding new research rounds, always update `research/sources.md` with new projects analyzed
- Audit previous work against new findings at synthesis checkpoints (rounds 10, 18, 26, 32, 35, 38)
- Cross-reference the approach used in `F:\experiments\pcn-publication-standards\docs\plans\2026-03-17-pcn-research-execution-plan.md`
