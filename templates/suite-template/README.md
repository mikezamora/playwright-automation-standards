# Playwright Suite Template

A production-ready Playwright test suite scaffold built from the [Playwright Automation Standards](../../standards/).

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests
npm test

# Run tests in headed mode
npm run test:headed

# Open interactive UI mode
npm run test:ui

# View the last HTML report
npm run report
```

## Project Structure

```
suite-template/
  playwright.config.ts          # TypeScript config with CI/local awareness
  tests/
    example.spec.ts             # Test file demonstrating standard patterns
    fixtures/
      index.ts                  # Custom typed fixtures via test.extend<T>()
    pages/
      example.page.ts           # Page Object Model with canonical patterns
  .github/
    workflows/
      playwright.yml            # CI workflow with sharding and report merge
  package.json                  # Minimal dependencies and scripts
```

## Standards Applied

This template implements the following standards:

### Configuration (S2)
- **S2.1** TypeScript configuration (`playwright.config.ts`)
- **S2.2** Environment-aware config via `process.env.CI`
- **S2.3** Multiple Playwright projects (setup + chromium)
- **S2.4** `webServer` with `reuseExistingServer: !process.env.CI`
- **S2.5** Three-tier timeout hierarchy (test > expect > action)
- **S2.6** Multi-reporter (blob + github for CI; html + list for local)
- **S2.7** Conditional artifact capture (`retain-on-failure`)

### Page Object Model (S3)
- **S3.2** Canonical constructor: `constructor(public readonly page: Page)`
- **S3.3** Three method categories: navigation, action, assertion
- **S3.4** No POM inheritance -- uses composition via fixtures
- **S3.5** Locator composition for dynamic content

### Fixtures (S4)
- **S4.1** Typed fixtures via `test.extend<T>()`
- **S4.2** Test-scoped data fixtures, worker-scoped shared resources
- **S4.4** Authentication via `storageState` pattern

### Validation (V1-V6)
- **V1.1** Web-first assertions throughout
- **V1.2** Guard assertions between action steps
- **V2.2** Environment-aware retries (0 local, 2 CI)
- **V2.3** Four-layer timeout hierarchy
- **V2.5** `maxFailures` for CI cost control

### CI/CD (C1-C7)
- **C1.1** Three-step CI workflow
- **C2.1** `workers=1` per shard with horizontal scaling
- **C2.2** Blob reporter with merge-reports for sharded execution
- **C5.2** Artifacts uploaded with `if: always()`
- **C7.2** Path filters for selective testing

### Naming (N1-N7)
- **N1.1** `.spec.ts` file extension
- **N1.3** kebab-case file names
- **N2.1** "should" phrasing for test descriptions
- **N3.1** PascalCase + `Page` suffix for POM classes

### Security (SEC1-SEC2)
- **SEC1.1** Setup projects with `storageState` for auth
- **SEC2.1** Credentials via environment variables (never hardcoded)
- **SEC2.2** `.auth/` directory excluded from version control

## Customization

1. **Update `baseURL`** in `playwright.config.ts` to match your application
2. **Update `webServer.command`** to start your application
3. **Add page objects** in `tests/pages/` following `example.page.ts` patterns
4. **Add fixtures** in `tests/fixtures/index.ts` for shared test setup
5. **Add auth setup** by creating `tests/auth.setup.ts` (see standards S4.4, SEC1.1)

## Further Reading

- [Structure Standards](../../standards/structure-standards.md)
- [Validation Standards](../../standards/validation-standards.md)
- [CI/CD Standards](../../standards/cicd-standards.md)
- [Semantic Conventions](../../standards/semantic-conventions.md)
- [Security Standards](../../standards/security-standards.md)
- [Section Guides](../section-guides/) for detailed per-topic guidance
- [Pre-Creation Checklist](../../checklist/pre-creation-checklist.md) for quality verification
