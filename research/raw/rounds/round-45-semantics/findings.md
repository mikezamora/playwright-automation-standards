# Round 45 — Findings: Glossary Validation Against Fresh Suites

## Executive Summary

The glossary entries from Rounds 41-44 hold up well against fresh suite analysis. All 42 terms validated as accurate. Four minor gaps identified and addressed: "setup project" needs explicit entry, "test.fail" underrepresented in examples, "testMatch" warrants a glossary note, and "global setup" vs "setup project" distinction needs clarification. Naming conventions confirmed stable across all 10 Gold suites.

---

## Finding 1: Recommended Terms Match Real Usage — 42/42 Validated

### Core API Terms (12/12 confirmed)
All Core API glossary entries use terminology consistent with actual suite code:

| Term | Usage in Suites | Match? |
|------|----------------|--------|
| Browser | Implicit in all 10 — rarely referenced directly | Yes |
| BrowserContext | Explicit in grafana-e2e (multi-context RBAC), calcom-e2e (storageState) | Yes |
| Page | Universal — 10/10 use `page` fixture | Yes |
| Frame | calcom-e2e (embed testing) — low frequency, definition accurate | Yes |
| Locator | Universal — 10/10 use locator methods | Yes |
| Route | grafana-e2e (data source mocking), calcom-e2e (API stubbing) | Yes |
| StorageState | 8/10 suites with auth — terminology matches docs | Yes |
| Trace | 8/10 configure trace — term matches docs | Yes |
| Request | immich-e2e, supabase-e2e — used as `request` fixture | Yes |
| Response | Used in API assertion context — matches docs | Yes |
| Dialog | Low frequency — definition matches docs | Yes |
| Download | Low frequency — definition matches docs | Yes |

### Test Organization Terms (10/10 confirmed)
All test organization terms match real code patterns:

- `test()` — Universal, 10/10
- `test.describe()` — 10/10, nesting depth varies (1-3 levels)
- `test.step()` — calcom-e2e confirms multi-step booking flow usage
- `test.skip()` — 10/10 (most common annotation)
- `test.fixme()` — 3/10 (grafana-e2e, calcom-e2e, affine-e2e)
- `test.slow()` — 2/10 (grafana-e2e, calcom-e2e)
- `test.fail()` — 1/10 (grafana-e2e only) — definition accurate but rare

### Configuration, Interaction, Assertion Terms — All confirmed
No discrepancies found between glossary definitions and real code usage.

---

## Finding 2: Four Glossary Gaps Identified

### Gap 1: "Setup Project" — Needs Explicit Entry
- **Issue:** The glossary mentions "dependency project" under Project but does not have a standalone entry for "setup project"
- **Evidence:** grafana-e2e, calcom-e2e, immich-e2e all use `{ name: 'setup', testMatch: /.*\.setup\.ts/ }` — the community universally calls this a "setup project"
- **Resolution:** Added note to Project glossary entry and semantic-conventions covering setup project naming

### Gap 2: "Global Setup" vs "Setup Project" Distinction
- **Issue:** `globalSetup` (config function) and a setup project (dependencies-based) serve similar purposes but are different mechanisms. The glossary does not distinguish them.
- **Evidence:** nextjs-e2e uses `globalSetup` for server startup; grafana-e2e uses a setup project for auth
- **Resolution:** Added disambiguation note to glossary

### Gap 3: "testMatch" Not Represented
- **Issue:** `testMatch` is referenced in conventions (e.g., `.spec.ts` matches the default) but has no glossary entry
- **Resolution:** Covered in semantic-conventions under file naming; not critical enough for standalone glossary entry

### Gap 4: "Flaky Test" — Community Term Not Formalized
- **Issue:** "Flaky test" appears in community discussions (grafana-e2e README, freecodecamp-e2e grep-invert patterns) but has no Playwright API equivalent
- **Resolution:** Addressed in Round 44 gap analysis — no change needed. Term is community vocabulary, not API vocabulary.

---

## Finding 3: Naming Convention Validation Across Suites

### File Naming — Conventions Hold

| Convention | Expected | Confirmed In | Exceptions |
|-----------|----------|--------------|------------|
| `.spec.ts` extension | 7/10 | grafana, calcom, affine, immich, excalidraw, grafana-plugin, nextjs | freecodecamp (`.test.ts`), supabase (`.test.ts`), slate (`.spec.ts`) |
| kebab-case filenames | 8/10 | grafana, calcom, affine, immich, excalidraw, freecodecamp, supabase, nextjs | slate (camelCase in some files) |
| Feature-based file names | 10/10 | All suites | None |

### Test Description Naming — Conventions Hold

| Convention | Expected | Confirmed In |
|-----------|----------|--------------|
| "should" phrasing dominant | 6/10 | calcom, freecodecamp, immich, grafana (partial), excalidraw, supabase |
| Imperative phrasing | 3/10 | affine, grafana (partial), nextjs |
| Feature:behavior phrasing | 1/10 | grafana-plugin (partial) |

### POM Naming — Universal

| Convention | Expected | Confirmed In |
|-----------|----------|--------------|
| PascalCase + `Page` suffix | Universal | All suites with POM patterns |
| camelCase method names | Universal | All suites with POM patterns |
| `goto()` (lowercase t) | Dominant | grafana, calcom, affine — 1 suite uses `goTo()` |

### Fixture Naming — Universal

| Convention | Expected | Confirmed In |
|-----------|----------|--------------|
| camelCase fixture names | Universal | grafana-plugin-e2e (`datasourcePage`), calcom (`bookingsPage`) |
| Noun-centric names | Universal | All fixture-using suites |
| No scope prefix convention | Confirmed | No suite distinguishes worker vs test scope in name |

---

## Finding 4: Terms NOT Missing — Confirmed Complete

Checked for terms that appear in suite code but are absent from glossary:

| Candidate Term | Status | Decision |
|---------------|--------|----------|
| `globalSetup` | Mentioned under Project | Added disambiguation note |
| `webServer` | Config option | Too specific for glossary — covered in config standards |
| `reporter` | Config option | Too specific for glossary — covered in CI standards |
| `outputDir` | Config option | Too specific for glossary |
| `testDir` | Config option | Too specific for glossary |
| `retries` | Config option | Mentioned under test.skip/fixme context |
| `timeout` | Config option | Universal concept, not Playwright-specific |

**Decision:** No new glossary entries needed. The 42-entry inventory is comprehensive for framework-specific terminology.

---

## Finding 5: Cross-Suite Consistency Assessment

**High consistency (same term, same meaning, same usage across all suites):**
- `page`, `locator`, `expect`, `test`, `test.describe`, `BrowserContext`, `storageState`

**Moderate consistency (same term, minor usage variations):**
- `test.step` — some suites use it extensively (calcom), others not at all
- `Route` — usage varies from full mock to partial intercept
- `Tag` — only grafana uses the v1.42 tag syntax

**Low consistency (term understood differently across suites):**
- None identified. All Playwright-specific terms are used consistently.

**Verdict:** The glossary accurately reflects how terms are used in practice. No corrections needed.
