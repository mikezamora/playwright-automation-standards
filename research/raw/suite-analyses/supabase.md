# Suite Analysis: supabase/supabase

**Repository:** https://github.com/supabase/supabase
**Suite Location:** `/apps/studio/tests/` (primarily Vitest, not Playwright)
**Tier:** Silver (contrasting — limited Playwright adoption)
**Round:** 15-16 (Contrasting Deep Dive)

---

## 1. Architecture Analysis

### Directory Structure
```
/apps/studio/tests/
  components/                  # Component-level tests
  config/                      # Test configuration
  features/                    # Feature-based tests
  lib/                         # Testing utilities
  pages/                       # Page/route-level tests
  setup/                       # Test setup
  unit/                        # Unit tests
  README.md                    # Testing guidelines
  fixtures.ts                  # Test data
  helpers.tsx                  # Utility functions
  vitestSetup.ts               # Vitest configuration
```

### Testing Stack
- **Primary framework: Vitest** (not Playwright for most tests)
- MSW (Mock Service Worker) for API mocking
- Custom `customRender` wrappers around testing functions
- Nuqs URL parameter mocking via `NuqsTestingAdapter`
- `QueryClientProvider` injection in test wrappers

### Playwright Presence
- Community-driven e2e repo: `supabase-community/e2e`
- Studio e2e tests undergoing cleanup (PR #37770)
- `globalSetup` pattern for Playwright UI integration
- Environment variables consolidated to `env.config.ts`

### POM / Fixtures
- `fixtures.ts` — test data objects
- `helpers.tsx` — render wrappers with provider injection
- MSW global mocks in `tests/lib/msw-global-api-mocks.ts`
- Feature-organized test directories

## 2. Validation Analysis

### Testing Principles (from README)
- Tests should "run consistently (avoid situations whereby tests fails sometimes)"
- Organized by feature rather than file structure
- Custom render wrappers inject required providers
- MSW mocks alongside tests

### API Mocking
- MSW for intercepting API calls
- Global mocks for common APIs
- Feature-specific mocks co-located with tests

## 3. CI/CD Analysis

### Infrastructure
- Vitest-based test runner (not Playwright CLI)
- Community-maintained e2e suite separate from main repo
- Auth setup via dedicated setup project in community e2e

## 4. Semantic Analysis

### Test Organization
- Feature-based directories: `features/`, `components/`, `pages/`
- Unit tests separated into `unit/` directory
- Setup and config directories for infrastructure

### Documentation
- README establishes testing guidelines
- Custom render function documented for provider injection
- Mock patterns documented

## 5. Key Patterns — Contrasts with Gold Standards

1. **Vitest-primary, not Playwright** — unlike all Gold suites, Supabase Studio's main test suite uses Vitest with JSDOM, not Playwright for browser automation
2. **MSW-based API mocking** — substitutes real API calls with Mock Service Worker, contrasting with Grafana/Immich's real-server approach
3. **Community-maintained e2e** — Playwright e2e tests live in `supabase-community/e2e`, not the main repo, indicating organizational separation of testing concerns
4. **Custom render wrappers** — `customRender` injects `QueryClientProvider` and `NuqsTestingAdapter`, a React Testing Library pattern absent from Playwright suites
5. **Feature-based organization** — organizes by feature domain rather than test type, aligning with component testing philosophy
6. **Active migration** — PR #37770 indicates ongoing e2e testing setup cleanup, suggesting Playwright adoption is in progress

### Key Contrast: Component Testing vs. E2E Testing
Supabase represents projects that invest heavily in component/integration testing (Vitest + MSW + React Testing Library) while maintaining minimal or community-driven Playwright e2e coverage. This contrasts sharply with Cal.com and Grafana, which invest primarily in Playwright e2e.
