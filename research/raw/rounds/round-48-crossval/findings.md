# Round 48 — Findings: Cross-Domain Validation

## Executive Summary

Standards generalize well across 5 application domains (e-commerce, SaaS, developer tools, CMS, communication). Structure (S1-S6) and validation (V1-V6) standards are domain-agnostic. Three domain-specific adaptations identified: (1) e-commerce requires multi-storefront testing patterns, (2) CMS platforms need content-model-aware test data strategies, (3) real-time communication apps need WebSocket testing patterns not covered in V5. The glossary terminology generalizes fully.

---

## Finding 1: Structure Standards Are Domain-Agnostic

Structure standards (S1-S6) apply identically across all 5 domains:

| Standard | E-commerce | SaaS | Dev Tools | CMS | Communication |
|----------|-----------|------|-----------|-----|---------------|
| S1.1 .spec.ts | Yes | Yes | Yes | Yes | Yes |
| S1.2 Dedicated dir | Yes | Yes | Yes | Yes | Yes |
| S1.5 Feature dirs | Yes (products/, orders/) | Yes (documents/) | No (flat) | Yes (admin/, content/) | Yes (channels/, messages/) |
| S2.1 TS config | 3/4 (WooCommerce exception) | Yes | Yes | Yes | Yes |
| S2.2 CI branching | Yes | Yes | Yes | Yes | Yes |
| S3.1 POM | Hybrid/Actor | Hybrid | None needed | Function helpers | Hybrid |

**Conclusion:** S1-S2 are fully domain-agnostic. S3 (POM) adoption varies by suite complexity, not by domain — consistent with the maturity spectrum in structure-standards.md.

### Domain-Specific Directory Patterns

| Domain | Typical Feature Directories |
|--------|-----------------------------|
| E-commerce | `products/`, `orders/`, `checkout/`, `customers/`, `catalog/` |
| SaaS Dashboard | `auth/`, `settings/`, `workspace/`, `documents/` |
| Developer Tools | Usually flat (small suites) |
| CMS | `admin/`, `content-manager/`, `content-types/`, `media/` |
| Communication | `channels/`, `messages/`, `users/`, `admin/` |

S1.5 correctly predicts this: "Name directories after application features or domains, not test types."

---

## Finding 2: E-Commerce Requires Multi-Storefront Testing Patterns

### The Pattern

E-commerce platforms (Shopware, WooCommerce, Saleor) all test two distinct frontends:
1. **Administration/Dashboard** — staff-facing management UI
2. **Storefront** — customer-facing shopping experience

This dual-frontend pattern requires:
- Separate page objects per frontend (Shopware: `ShopAdmin` vs `ShopCustomer`)
- Different auth flows per frontend (admin login vs customer login)
- Different viewport/device configurations per frontend
- Potentially different base URLs

### Standards Assessment

- **S3.1 (POM):** Partially covers this through the "multiple Playwright projects" approach, but doesn't explicitly address multi-frontend page objects
- **S4.4 (Auth):** Covers multi-role auth well (admin, viewer, editor), which extends naturally to admin vs customer
- **V6.2 (storageState):** Multi-role auth via separate `.auth/*.json` files applies directly

### Recommendation

Add a note to S2.3 (multiple projects):
> **E-commerce pattern:** Define separate projects for administration and storefront, each with its own baseURL, viewport, and auth state. Example: `{ name: 'admin', use: { baseURL: '/admin' } }` and `{ name: 'storefront', use: { baseURL: '/' } }`.

---

## Finding 3: CMS Platforms Need Content-Model-Aware Test Data

### The Pattern

CMS platforms (Strapi) have a unique test data challenge: the content model itself is configurable. Tests must:
1. Create content types (schemas) as test data
2. Create content entries conforming to those types
3. Test the admin UI for managing both types and entries
4. Test the API for consuming content

This is more complex than the factory pattern in S6.2 because the "schema" of test data is itself dynamic.

### Standards Assessment

- **S6.1 (API for test data):** Applies — Strapi uses API calls to create content types and entries
- **S6.2 (Factory functions):** Partially applies — factories need a two-level approach (type factory + entry factory)
- **S6.3 (Cleanup via fixture teardown):** Applies — but cleanup order matters (delete entries before types)

### Recommendation

Add to S6.2:
> **CMS pattern:** When the application's data model is user-configurable, factories may need two levels: schema/type factories (create the data structure) and entry/record factories (create instances of that structure). Cleanup must respect dependency order.

---

## Finding 4: Real-Time Apps Need WebSocket Testing Patterns

### The Gap

Communication platforms (RocketChat) rely heavily on WebSocket connections for real-time messaging. Current validation standards (V5) cover HTTP network interception but not WebSocket testing.

Playwright supports WebSocket interception via `page.on('websocket')` and `webSocket.on('framereceived')`, but this is not covered in:
- V5.1 (page.route for network) — HTTP only
- V5.2 (mock payloads) — HTTP response mocking only

### Assessment

This is a genuine gap in V5, but it's niche:
- 0/10 Gold suites use WebSocket testing explicitly
- RocketChat's e2e tests mostly test UI behavior without mocking WebSockets
- WebSocket testing is more common in integration tests than E2E tests

### Recommendation

Add a note to V5.1:
> **Real-time applications:** For WebSocket-dependent features, use `page.on('websocket')` to intercept connections and `webSocket.on('framereceived')` to assert on messages. Most E2E tests can test WebSocket features through UI assertions without direct WebSocket interception.

---

## Finding 5: Validation Standards Generalize Without Domain Tuning

Assertion patterns (V1), retry strategies (V2), and wait patterns (V3) are identical across domains:

| Validation Pattern | E-commerce | SaaS | Dev Tools | CMS | Communication |
|-------------------|-----------|------|-----------|-----|---------------|
| Web-first assertions | Universal | Universal | Universal | Universal | Universal |
| Guard assertions | Heavy use | Heavy use | Light use | Heavy use | Heavy use |
| CI retries (0 local) | Universal | Universal | Universal | Universal | Universal |
| CI retry count | 2 | 2 | 1 | 2 | 2 |
| toPass() usage | Rare | Moderate | None | Rare | Rare |
| Network mocking | Moderate | Moderate | None | Heavy | Light |

**Key insight:** The retry count correlates with infrastructure complexity (V2.2), not with domain. This confirms the infrastructure-to-retry mapping is the correct model.

---

## Finding 6: CI/CD Standards Are Domain-Agnostic with One Exception

CI/CD patterns (C1-C7) apply identically across domains with one exception:

**WordPress/WooCommerce uses wp-env instead of standard webServer:**
- Instead of `webServer` config to start the app, WooCommerce uses `wp-env` (a Docker-based WordPress environment manager)
- This is analogous to Pattern D in S2.4 (Docker Compose orchestration) but specific to WordPress
- Standard S2.4 already covers this: "When to skip: Applications requiring Docker Compose"

### Sharding Patterns by Domain

| Domain | Sharding Strategy | Matches C4? |
|--------|------------------|-------------|
| E-commerce (large) | By feature area | Yes (C4.1) |
| SaaS | By test file | Yes (C4.1) |
| CMS | By domain (admin, content) | Partially (domain = project) |
| Small suites | No sharding needed | Yes (C4 is optional) |

---

## Finding 7: Glossary Terminology Generalizes Fully

All 42 glossary entries were checked against domain-specific usage:

| Term | Domain-Specific Meaning? | Notes |
|------|-------------------------|-------|
| Locator | No | Same meaning everywhere |
| Fixture | No | Same meaning in Playwright context |
| Project | No | Same config concept |
| Worker | No | Same parallelism concept |
| StorageState | No | Same auth mechanism |
| Page Object | **Slight** | E-commerce uses "Actor" instead of "Page" in Shopware |

**The only terminology note:** E-commerce suites using the actor pattern may say "actor" where others say "page object." This is already partially covered by Pitfall 2 (cross-framework fixture confusion) — the principle extends to POM terminology.

---

## Finding 8: Domain-Specific Adaptations Summary

| Domain | Standards Fully Apply? | Adaptations Needed |
|--------|----------------------|-------------------|
| E-commerce | 95% | Multi-storefront project pattern; actor POM variant |
| SaaS dashboards | 98% | None significant |
| Developer tools | 98% | Small suite guidance already in maturity spectrum |
| Content management | 92% | Content-model-aware test data; domain-scoped config |
| Communication/real-time | 93% | WebSocket testing note in V5 |

**Overall:** Standards are 93-98% domain-agnostic. The 2-7% of domain-specific needs are addressable with notes and examples, not new standard sections.
