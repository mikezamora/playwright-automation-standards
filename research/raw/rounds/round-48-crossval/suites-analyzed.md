# Round 48 — Suites & Sources Analyzed: Cross-Domain Validation

## Scope

Test whether standards generalize across application domains NOT yet well-covered: mobile-first applications, SaaS dashboards, developer tools, content management systems, and e-commerce platforms. Identify domain-specific adaptations needed.

## Sources Consulted

| # | Source | Domain | Key Characteristics |
|---|--------|--------|-------------------|
| 1 | saleor/saleor-dashboard | **E-commerce dashboard** | GraphQL-powered SaaS dashboard with complex product/order management; permission-based access; fixture-injected POMs |
| 2 | shopware/acceptance-test-suite | **E-commerce platform** | Multi-storefront (admin + customer); actor-based testing; published npm package for plugin testing |
| 3 | strapi/strapi | **Content management** | Headless CMS; domain-scoped test architecture (admin, content-manager, content-type-builder); per-domain config |
| 4 | woocommerce/woocommerce | **E-commerce (WordPress)** | WordPress plugin; PHP ecosystem with JS test tooling; wp-env for site setup; Puppeteer migration legacy |
| 5 | CorentinTh/it-tools | **Developer tools** | Small utility application; Vue.js frontend; minimal test infrastructure; embedded e2e in src/ |
| 6 | documenso/documenso | **SaaS application** | Document signing platform; Next.js monorepo; turborepo; known flakiness challenges |
| 7 | RocketChat/e2e-playwright | **SaaS communication** | Chat platform; real-time messaging; complex state management; dedicated e2e repo |
| 8 | Shopify/hydrogen-demo-store | **E-commerce (headless)** | React/Remix storefront; Shopify API integration; SSR testing |
| 9 | redhat-developer/consoledot-e2e | **Developer tools (enterprise)** | Red Hat console; enterprise dashboard; multi-service backend |
| 10 | Playwright monorepo patterns (Turborepo guide) | **Reference architecture** | Official Turborepo Playwright guide for monorepo e2e testing patterns |

## Domain Coverage Matrix

| Domain | Suites Analyzed | Previously Covered? |
|--------|----------------|-------------------|
| Mobile-first apps | Hydrogen (responsive), Saleor (responsive) | Partially (Cal.com) |
| SaaS dashboards | Saleor, Red Hat consoledot | Partially (Grafana) |
| Developer tools | it-tools, consoledot | No |
| Content management | Strapi | No |
| E-commerce platforms | Shopware, WooCommerce, Saleor, Hydrogen | Partially (ovcharski boilerplate in Bronze) |

## Cross-Domain Research Questions

1. Do structure standards (S1-S6) apply regardless of application domain?
2. Do validation patterns (V1-V6) need domain-specific tuning?
3. Do CI/CD patterns (C1-C7) differ by domain?
4. Are there domain-specific testing concerns the standards miss?
5. Does the glossary terminology generalize across domains?
