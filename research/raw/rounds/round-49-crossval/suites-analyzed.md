# Round 49 — Suites & Sources Analyzed: Scale Validation

## Scope

Compare standards against suites of different scales to determine which standards are scale-dependent and which are universal. Test whether standards scale from 10-test suites to 500+ test suites and monorepos.

## Suites by Scale Category

### Small Suites (10-30 tests)

| # | Suite | Tests | Domain | Key Characteristics |
|---|-------|-------|--------|-------------------|
| 1 | CorentinTh/it-tools | ~15 | Developer tools | Vue.js, flat file structure, no POM, minimal config |
| 2 | Shopify/hydrogen-demo-store | ~12 | E-commerce | Remix/React, single config, focused checkout flow |
| 3 | bucket-cms | ~10 | CMS | Next.js, minimal tests, basic coverage |

### Medium Suites (30-100 tests)

| # | Suite | Tests | Domain | Key Characteristics |
|---|-------|-------|--------|-------------------|
| 4 | documenso/documenso | ~45 | SaaS | Monorepo (turborepo), Next.js, growing suite |
| 5 | excalidraw/excalidraw (prev. analyzed) | ~60 | Drawing tool | Canvas testing, visual regression |
| 6 | saleor/saleor-dashboard | ~80 | E-commerce | POM + fixtures, permission-based, GraphQL |

### Large Suites (100+ tests)

| # | Suite | Tests | Domain | Key Characteristics |
|---|-------|-------|--------|-------------------|
| 7 | woocommerce/woocommerce | ~200+ | E-commerce | WordPress plugin, migrated from Puppeteer |
| 8 | strapi/strapi | ~150+ | CMS | Domain-scoped architecture, multi-config |
| 9 | shopware/acceptance-test-suite | ~120+ | E-commerce | Actor pattern, npm package, multi-storefront |

### Monorepo Suites (multiple apps, shared fixtures)

| # | Suite | Apps | Domain | Key Characteristics |
|---|-------|------|--------|-------------------|
| 10 | calcom/cal.com (prev. analyzed) | 7 projects | Scheduling | Turborepo, shared fixtures across packages |
| 11 | strapi/strapi | 3+ domains | CMS | Per-domain config, parallel domain execution |
| 12 | AFFiNE (prev. analyzed) | 3 packages | Knowledge base | Workspace-based organization |

## Analysis Dimensions

For each scale category, evaluate:
1. Which standards are applicable vs. N/A?
2. Which standards are essential vs. optional?
3. What scale-specific guidance is needed?
4. Do the maturity spectrum levels (S1-S4 maturity) correlate with scale?
