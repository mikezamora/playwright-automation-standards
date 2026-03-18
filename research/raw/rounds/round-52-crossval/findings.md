# Round 52 — Findings: Gap Resolution (Part 2)

## Executive Summary

Addressed gaps 5-9 from cross-validation. All resolved with additive changes. Two quality criteria additions (over-engineering anti-pattern, migration awareness) are the most significant updates.

---

## Gap 5 Resolution: WebSocket Testing — Add Note to V5.1

**Gap:** V5.1 covers `page.route()` for HTTP interception but not WebSocket testing patterns needed by real-time apps.

**Resolution:** Add a note to V5.1:

> **Real-time applications:** For WebSocket-dependent features, use `page.on('websocket')` to intercept connections and `webSocket.on('framereceived')` to assert on messages. Most E2E tests can test WebSocket-driven features through UI assertions without direct WebSocket interception — the UI reflects the WebSocket state.

**Assessment:** This is a narrow gap (0/10 Gold suites use WebSocket interception explicitly). RocketChat tests WebSocket features through UI assertions, validating that direct WebSocket testing is rarely needed in E2E context. The note ensures coverage for teams with explicit WebSocket testing requirements.

---

## Gap 6 Resolution: Monorepo Selective Execution — Add Note to C7.2

**Gap:** C7.2 (path filters and selective testing) doesn't explicitly cover dependency-graph-based filtering in monorepos.

**Resolution:** Add a note to C7.2:

> **Monorepo pattern:** In monorepos (Cal.com, Strapi), use dependency-graph tools (Turborepo `--filter`, nx affected) to run E2E tests only for packages affected by the change. Combine with `paths` filters: `paths: ['packages/app/**', 'packages/shared/**', 'e2e/**']`.

**Assessment:** The existing `paths` filter guidance covers the basic case. The note adds monorepo-specific tooling awareness.

---

## Gap 7 Resolution: Migration Debt — Add Section to Quality Criteria

**Gap:** Suites migrated from other frameworks carry characteristic anti-patterns that standards identify but don't contextualize as migration debt.

**Resolution:** Add migration awareness to the quality criteria as a diagnostic tool:

> **Migration Debt Patterns**
>
> Suites migrated from other frameworks carry characteristic anti-patterns:
>
> | Source Framework | Common Debt | Standards That Diagnose |
> |-----------------|-------------|----------------------|
> | Puppeteer | `waitForSelector`, `globalSetup`, JS config | V3.1, SEC1.1, S2.1 |
> | Cypress | `cy.wait()` habits, fixture confusion, single-tab mindset | V3.3, Glossary (fixture), V6.1 |
> | Selenium | POM inheritance, explicit waits, CSS selectors | S3.4, V3.1, N7.3 |
>
> These are not design flaws but migration artifacts. Use standards as a migration checklist — prioritize high-severity items (V3.1, S3.4) over low-severity ones (S2.1).

---

## Gap 8 Resolution: Over-Engineering Anti-Pattern — Add to Quality Criteria

**Gap:** Standards don't warn against adding unnecessary abstraction layers on top of Playwright.

**Resolution:** Add anti-pattern to quality criteria:

> **Anti-pattern: Framework on top of a framework.** Adding abstraction layers (Excel data drivers, custom wait wrappers, reporting abstractions) that duplicate or obscure Playwright's native capabilities. Playwright is already a testing framework — adding another framework on top increases complexity without proportional value. Signs: test code never directly calls Playwright APIs; configuration exceeds 200 lines for a simple app; custom retry/wait logic duplicates built-in mechanisms.

**Assessment:** This fills a real gap. The rishivajre framework and similar community boilerplates demonstrate this anti-pattern. It is consistently absent from all 10 Gold suites, which use Playwright's native APIs directly.

---

## Gap 9 Resolution: CMS Content-Model Factories — Add Note to S6.2

**Gap:** S6.2 (factory functions) doesn't cover CMS platforms where the data schema itself is user-configurable.

**Resolution:** Add a note to S6.2:

> **CMS/configurable-schema pattern:** When the application's data model is user-configurable (CMS, form builders, low-code platforms), factories may need two levels: (1) schema/type factories that create the data structure, and (2) entry/record factories that create instances of that structure. Cleanup must respect dependency order — delete entries before deleting the types they conform to.

---

## Summary of All Gap Resolutions (Rounds 51-52)

| Gap # | Area | Resolution | Priority |
|-------|------|-----------|----------|
| 1 | S3.1 — Actor POM Variant F | Add row to decision framework | Medium |
| 2 | S2.3 — Domain-scoped config | Add CMS/modular platform note | Low |
| 3 | S2.1 — JS config context | Add ecosystem context note | Low |
| 4 | S2.3 — Multi-frontend projects | Add e-commerce/CMS note | Low |
| 5 | V5.1 — WebSocket testing | Add real-time apps note | Low |
| 6 | C7.2 — Monorepo filtering | Add dependency-graph note | Low |
| 7 | Quality Criteria — Migration debt | Add diagnostic section | Medium |
| 8 | Quality Criteria — Over-engineering | Add anti-pattern | Medium |
| 9 | S6.2 — CMS factories | Add two-level factory note | Low |

**Zero contradictions found. Zero standards reversed. All changes additive.**
