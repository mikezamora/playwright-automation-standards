# Suite Analysis: excalidraw/excalidraw

**Repository:** https://github.com/excalidraw/excalidraw
**Suite Location:** `/packages/excalidraw/tests/` (Vitest) + `/excalidraw-app/tests/` (unit)
**Tier:** Silver (contrasting — Vitest-primary, Playwright experimental)
**Round:** 15-16 (Contrasting Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/packages/excalidraw/tests/    # Main test suite (33 files)
  __snapshots__/               # Snapshot baselines
  data/                        # Test data
  fixtures/                    # Test fixtures
  helpers/                     # Test utilities
  packages/                    # Package-level tests
  queries/                     # Query tests
  scene/                       # Scene tests
  App.test.tsx                 # + 33 .test.tsx/.test.ts files
  test-utils.ts                # Shared test utilities

/excalidraw-app/tests/         # App-level tests (3 files)
  __snapshots__/
  LanguageList.test.tsx
  MobileMenu.test.tsx
  collab.test.tsx
```

### Testing Stack
- **Primary framework: Vitest** (inferred from `vitest.config.mts`, `.test.tsx` naming)
- React Testing Library for component tests
- Snapshot testing via `__snapshots__/` directories
- **Playwright: experimental/POC only** — PR #9419 for visual regression, PR #9088 for accessibility

### Playwright Status
- **Visual regression POC** (PR #9419, April 2025): component testing library for screenshot comparison
- **Accessibility testing** (PR #9088): Axe-core + Playwright integration in GitHub Actions
- Neither merged as standard practice — still experimental

### POM / Fixtures
- `fixtures/` — test data for Vitest tests
- `helpers/` — test utility functions
- `test-utils.ts` — shared testing utilities
- No Playwright page objects or fixtures

## 2. Validation Analysis

### Testing Approach
- Component-level assertions via React Testing Library
- Snapshot testing for UI regression
- Canvas-specific testing challenges (drawing, selection, rotation)
- 33 test files covering: arrows, clipboard, selection, history, export, context menus

### Test Coverage Areas
- Drawing operations: `dragCreate.test.tsx`, `lasso.test.tsx`, `rotate.test.tsx`
- UI interactions: `contextmenu.test.tsx`, `selection.test.tsx`, `library.test.tsx`
- Data operations: `clipboard.test.tsx`, `export.test.tsx`
- State management: `history.test.tsx`, `elementLocking.test.tsx`

## 3. CI/CD Analysis

### Infrastructure
- Vitest runner (not Playwright CLI)
- GitHub Actions for CI
- Playwright accessibility tests integrated in PR workflow (experimental)
- Visual regression via Playwright component testing (POC)

## 4. Semantic Analysis

### Test Naming
- Files: `camelCase.test.tsx` or `camelCase.test.ts` — different from Playwright convention
- No `.spec.ts` files — consistent Vitest/Jest naming
- Feature-descriptive: `arrowBinding`, `elementLocking`, `dragCreate`

### Organization
- `helpers/`, `fixtures/`, `queries/`, `scene/` — domain subdirectories
- `__snapshots__/` — standard snapshot directory convention

## 5. Key Patterns — Contrasts with Gold Standards

1. **Canvas-first testing challenge** — Excalidraw's canvas-based UI makes traditional DOM-based Playwright testing difficult, driving Vitest adoption
2. **Vitest + React Testing Library** — primary testing strategy uses component-level testing, not browser automation
3. **Playwright as supplementary only** — used experimentally for visual regression and accessibility, not core E2E
4. **Snapshot-heavy approach** — `__snapshots__/` directories indicate reliance on snapshot comparison over behavioral assertions
5. **camelCase file naming** — `arrowBinding.test.tsx` instead of Playwright's `arrow-binding.spec.ts` convention
6. **No playwright.config.ts at root** — Playwright config exists only in PR branches, not merged to main
7. **33 component tests vs. 0 E2E tests** — inverted testing pyramid compared to Gold suites

### Key Contrast: Canvas Applications
Excalidraw demonstrates that canvas-based applications may not benefit from traditional Playwright E2E testing. Component testing with JSDOM provides faster, more reliable feedback for rendering logic, while Playwright's visual regression capabilities (screenshot comparison) address the visual correctness gap.
