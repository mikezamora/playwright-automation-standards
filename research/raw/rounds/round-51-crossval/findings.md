# Round 51 — Findings: Gap Resolution (Part 1)

## Executive Summary

Addressed gaps 1-4 from cross-validation. All four gaps resolved with additive changes (notes, variants, examples). No standards reversed or weakened.

---

## Gap 1 Resolution: Actor-Based POM — Add Variant F to S3.1

**Gap:** Shopware's actor pattern (ShopAdmin, ShopCustomer) is a valid POM architecture not documented in S3.1's decision framework.

**Resolution:** Add Variant F to the decision framework table in S3.1.

| Suite Characteristics | Recommended Approach | Example |
|---|---|---|
| Multi-role workflows, dual-frontend apps, screenplay pattern | **Actor-based POM** (Variant F) | Shopware acceptance-test-suite |

**Rationale:**
- The actor pattern is composition-based (not inheritance) — consistent with S3.4
- It wraps page objects with role-specific behavior and task-based reuse
- Published as an npm package (`@shopware-ag/acceptance-test-suite`) — same maturity indicator as Grafana plugin-e2e
- Does NOT contradict existing variants — it is an additive option for multi-role apps

**Naming note for N3.1:** Actor-pattern suites may use role names (ShopAdmin, ShopCustomer) instead of the PascalCase+Page suffix convention. This is valid when the role is the primary organizational unit, not the page.

---

## Gap 2 Resolution: Domain-Scoped Config — Add Note to S2.3

**Gap:** Strapi spawns separate app instances per test domain (admin, content-manager), each with its own `playwright.config.ts`.

**Resolution:** Add a note to S2.3 under the "Large teams" guidance:

> **CMS/modular platform pattern:** Platforms with independent admin domains (Strapi, Directus) may use per-domain `playwright.config.ts` files, each spawning its own application instance. This is analogous to the monorepo pattern where each package has its own config.

**Assessment:** This is a niche pattern (1 suite observed). The existing "Large teams" guidance in S2.3 is sufficient for most cases. A note ensures completeness without overweighting a single observation.

---

## Gap 3 Resolution: WordPress JS Config — Add Context Note to S2.1

**Gap:** WooCommerce uses `.config.js` in a production-grade suite, but S2.1 marks JS config as an anti-pattern.

**Resolution:** The standard stands. Add a context note:

> **Ecosystem context:** Some ecosystems (WordPress/PHP, legacy .NET) maintain JavaScript toolchains where TypeScript adoption has not yet reached test configuration. The recommendation to use TypeScript config remains — the benefits (type safety for project definitions, reporter config, and use options) apply regardless of the application's primary language. WooCommerce's use of JS config is a migration debt pattern, not a best practice.

**Rationale:** One suite's deviation does not override the 22/22 production suite consensus. The note acknowledges the reality without weakening the standard.

---

## Gap 4 Resolution: E-Commerce Multi-Storefront — Add Note to S2.3

**Gap:** E-commerce platforms (Shopware, Saleor, WooCommerce) test two distinct frontends (admin + storefront) needing separate projects.

**Resolution:** Add a note to S2.3:

> **Multi-frontend pattern (e-commerce, CMS):** Applications with distinct user-facing frontends (admin dashboard + public storefront) SHOULD define separate Playwright projects per frontend, each with its own `baseURL`, viewport, and auth state. Example: `{ name: 'admin', use: { baseURL: '/admin' } }` and `{ name: 'storefront', use: { baseURL: '/' } }`.

**Assessment:** This pattern extends naturally from the existing multi-project guidance. The note makes the pattern explicit for teams building multi-frontend applications.

---

## Summary of Changes

| Gap | Standard | Change Type | Severity |
|-----|----------|-------------|----------|
| 1 | S3.1 | Add Variant F row to decision framework | Medium |
| 2 | S2.3 | Add CMS/modular platform note | Low |
| 3 | S2.1 | Add ecosystem context note | Low |
| 4 | S2.3 | Add multi-frontend note | Low |

All changes are additive. Zero standards reversed.
