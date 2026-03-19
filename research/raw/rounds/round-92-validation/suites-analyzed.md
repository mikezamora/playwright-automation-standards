# Round 92 — Suites Analyzed

| # | Suite | Repository | Stars | Category | Test Files | Scale Tier |
|---|-------|-----------|-------|----------|-----------|-----------|
| 1 | Lexical | facebook/lexical | 23,122 | Rich text editor | 50+ | Medium |
| 2 | Twenty CRM | twentyhq/twenty | 40,567 | CRM | 8 | Small |
| 3 | Payload CMS | payloadcms/payload | 41,319 | Headless CMS | 82 | Large |
| 4 | Nhost | nhost/nhost | 9,107 | BaaS dashboard | 26 | Small-Medium |
| 5 | Formbricks | formbricks/formbricks | 11,987 | Survey tool | 18 | Small-Medium |
| 6 | Builder.io | BuilderIO/builder | 8,645 | Visual CMS / SDK | 52 | Medium |

## Key Files Read Per Suite

### Lexical
- `playwright.config.js` (49 LOC, 3 projects)
- `packages/lexical-playground/__tests__/e2e/History.spec.mjs` (7 tests, 85-90 lines avg)
- `packages/lexical-playground/__tests__/e2e/Links.spec.mjs` (62 tests, 30-40 lines avg)
- `packages/lexical-playground/__tests__/e2e/TextFormatting.spec.mjs` (29 tests, 25-35 lines avg)

### Twenty CRM
- `packages/twenty-e2e-testing/playwright.config.ts` (94 LOC, 2 projects)
- `packages/twenty-e2e-testing/tests/create-record.spec.ts` (1 test, ~100 lines)
- `packages/twenty-e2e-testing/tests/workflow-creation.spec.ts` (1 test, ~50 lines)
- `packages/twenty-e2e-testing/tests/authentication/signup_invite_email.spec.ts` (1 test, ~50 lines, uses test.step)

### Payload CMS
- `test/playwright.config.ts` (42 LOC, 1 project)
- `test/auth/e2e.spec.ts` (11 tests, 15-25 lines avg)
- `test/fields/collections/Text/e2e.spec.ts` (24 tests, 8-12 lines avg)
- `test/access-control/e2e.spec.ts` (~200+ tests, 5-15 lines avg)

### Nhost
- `dashboard/playwright.config.ts` (47 LOC, 4 projects)
- `dashboard/e2e/auth/create-user.test.ts` (2 tests, ~8 lines avg)
- `dashboard/e2e/database/tables/create-table.test.ts` (10 tests, ~35 lines avg)
- `dashboard/e2e/overview/overview.test.ts` (3 tests, ~8 lines avg)
- `dashboard/e2e/fixtures/auth-hook.ts` (auth fixture)

### Formbricks
- `playwright.config.ts` (102 LOC, 1 project)
- `apps/web/playwright/survey.spec.ts` (3 tests, ~250 lines avg)
- `apps/web/playwright/api/auth/security.spec.ts` (7 tests, ~60-80 lines avg)
- `apps/web/playwright/signup.spec.ts` (4 tests, ~7 lines avg)
- `apps/web/playwright/lib/fixtures.ts` (users fixture)

### Builder.io
- `packages/sdks-tests/playwright.config.ts` (145 LOC, dynamic projects)
- `packages/sdks-tests/src/e2e-tests/blocks.spec.ts` (~30 tests, 15-40 lines avg)
- `packages/sdks-tests/src/e2e-tests/ab-test.spec.ts` (42 tests, 15-25 lines avg)
- `packages/sdks-tests/src/e2e-tests/custom-components.spec.ts` (10 tests, 6-8 lines avg)
