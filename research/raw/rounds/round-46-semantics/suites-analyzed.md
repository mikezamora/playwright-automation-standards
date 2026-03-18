# Round 46 — Suites & Sources Analyzed: Definitive Semantic Conventions

## Scope

Write the DEFINITIVE `standards/semantic-conventions.md` covering all naming and categorization conventions. Each standard requires clear recommendation, 2+ suite citations, valid alternatives, and anti-patterns. Write audit notes documenting changes from preliminary, confidence levels, and remaining uncertainties.

## Sources Consulted

| # | Source | Used For |
|---|-------|----------|
| 1 | grafana-e2e | File naming, project naming, tag usage, POM patterns, annotation patterns |
| 2 | calcom-e2e | Test descriptions, fixture naming, POM patterns, step labels, test categorization |
| 3 | affine-e2e | Kit/package naming, helper organization, kebab-case file naming |
| 4 | immich-e2e | API test naming, project categorization, data-testid patterns |
| 5 | excalidraw-e2e | Small-suite naming patterns, spec.ts usage |
| 6 | freecodecamp-e2e | Custom testId attribute, contributor guide terminology, grep-based filtering |
| 7 | grafana-plugin-e2e | Published fixture library naming, custom matcher naming, role-based projects |
| 8 | slate-e2e | Component test naming, fullyParallel configuration naming |
| 9 | supabase-e2e | API integration test naming, .test.ts convention |
| 10 | nextjs-e2e | Framework test naming, imperative test descriptions |
| 11 | Playwright Official Docs (v1.50) | Canonical recommendations for locator strategy, testMatch, tags |
| 12 | eslint-plugin-playwright | Rule names encoding naming best practices |
| 13 | Rounds 1-45 findings | All accumulated evidence from prior research |
| 14 | Preliminary semantic-conventions.md | Baseline for revision tracking |

## Standards Development Process

1. Reviewed preliminary conventions (from Rounds 1-12)
2. Cross-referenced with all evidence from Rounds 13-45
3. Expanded from 5 sections (N1-N5) to 8 sections covering all requested areas
4. Added anti-patterns and alternatives for every standard
5. Ensured minimum 2 suite citations per standard
6. Documented confidence levels and remaining uncertainties in audit notes
