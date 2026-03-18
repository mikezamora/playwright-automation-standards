# Round 46 — Findings: Definitive Semantic Conventions

## Executive Summary

The DEFINITIVE `standards/semantic-conventions.md` has been written with 8 sections, 30+ individual standards, each with recommendations, citations, alternatives, and anti-patterns. The document expands the preliminary version from 5 sections to 8, adding Tag/Annotation Conventions, Test Categorization Taxonomy, Data Attribute Conventions, and Common Pitfalls. The glossary has received its final validation pass. The semantic-patterns synthesis has been marked FINAL.

---

## Finding 1: Expansion from Preliminary to Definitive

### Section Changes

| Section | Preliminary | Definitive | Change |
|---------|------------|------------|--------|
| N1. File Naming | 3 standards | 4 standards | Added setup file naming convention |
| N2. Test Naming | 2 standards | 4 standards | Added test.step labels, split describe strategies |
| N3. POM Naming | (was part of N4) | 4 standards | Dedicated section; class, method, locator, fixture POM |
| N4. Fixture Naming | (was part of N4) | 3 standards | Dedicated section; fixture, option, factory naming |
| N5. Tag/Annotation | (was part of N5) | 4 standards | Dedicated section; tags, built-in annotations, grep, custom |
| N6. Test Categorization | (was part of N5) | 3 standards | Taxonomy: smoke, regression, critical path, etc. |
| N7. Data Attributes | (was part of N3) | 3 standards | Dedicated section; naming, structure, custom attributes |
| N8. Common Pitfalls | NEW | 5 pitfalls | Terms misused or ambiguously applied |

### Standards Count
- Preliminary: ~12 standards across 5 sections
- Definitive: 30 standards across 8 sections

---

## Finding 2: Key Standard Decisions

### Decision 1: `.spec.ts` as SHOULD (not MUST)
- **Rationale:** 7/10 Gold suites use it, but `.test.ts` is a valid alternative (freecodecamp, supabase). Forcing `.spec.ts` would conflict with existing Jest/Vitest conventions in hybrid repos.
- **Confidence:** HIGH

### Decision 2: "should" test descriptions as primary recommendation
- **Rationale:** 6/10 Gold suites use "should" phrasing. Imperative phrasing (3/10) is a valid alternative. Feature:behavior (1/10) is too rare to recommend as primary.
- **Confidence:** MEDIUM — teams have strong preferences here; both "should" and imperative are acceptable.

### Decision 3: `data-testid` documented as dominant practice despite official `getByRole` recommendation
- **Rationale:** 7/10 Gold suites use `data-testid` extensively. The convention documents both the official recommendation (getByRole first) and the practical reality (data-testid as workhorse). This is the most notable gap between official guidance and observed practice.
- **Confidence:** HIGH

### Decision 4: Tags documented as emerging, not required
- **Rationale:** Only 1/10 Gold suites (grafana) uses the v1.42 tag syntax. Project-based categorization remains dominant. Tags are recommended for teams that need runtime filtering beyond what projects provide.
- **Confidence:** HIGH

### Decision 5: Common pitfalls section added
- **Rationale:** Several terms are consistently misused across community discussions: "selector" vs "locator", "fixture" cross-framework confusion, "flaky" as a diagnosis rather than a symptom. Documenting these prevents miscommunication.
- **Confidence:** HIGH

---

## Finding 3: Glossary Final Validation Pass

The glossary was reviewed for:
1. **Accuracy:** All definitions checked against Playwright v1.50 docs — no corrections needed
2. **Completeness:** 42 entries covering all Playwright-specific terms — comprehensive
3. **Consistency:** Terminology matches what appears in semantic-conventions.md — aligned
4. **Cross-references:** Related terms link correctly — verified
5. **Status updated:** From "Initial population" to "FINAL — validated in Rounds 45-46"

### Minor Glossary Updates
- Added "Global Setup" disambiguation note under Project entry
- Updated status header to FINAL
- No definition changes required — Round 44 preparation was thorough

---

## Finding 4: Semantic Patterns Marked FINAL

The `research/synthesis/semantic-patterns.md` status updated from "Updated with Rounds 41-44" to "FINAL — all patterns validated and codified in standards/semantic-conventions.md". No content changes required — the patterns accurately reflect what was codified into standards.

---

## Finding 5: Confidence Levels by Standard Area

| Area | Confidence | Basis |
|------|-----------|-------|
| File naming (.spec.ts, kebab-case) | HIGH | 7-8/10 Gold suites consistent |
| Test descriptions ("should" phrasing) | MEDIUM | 6/10 use it; alternatives viable |
| POM naming (PascalCase + Page) | HIGH | Universal across all POM-using suites |
| Fixture naming (camelCase) | HIGH | Universal TypeScript convention |
| Tag conventions | LOW-MEDIUM | Only 1/10 adopted; recommendations are forward-looking |
| Test categorization taxonomy | MEDIUM | Terms are industry-standard; Playwright-specific usage less codified |
| Data attribute conventions | HIGH | 7/10 use data-testid; pattern well-established |
| Common pitfalls | HIGH | Validated against community discussions and migration guides |
