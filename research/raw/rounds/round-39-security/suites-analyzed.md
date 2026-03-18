# Round 39 — Suites & Sources Analyzed: Deep Dive — Auth State, Multi-Role, Secrets

## Scope

Deep dive into auth state management across tests, multi-role testing strategies, how secrets are managed in test code, and security regression testing patterns. Assess what is production-ready vs. experimental.

## Sources Cross-Referenced for Deep Dive

| # | Source | Used For |
|---|--------|----------|
| 1 | Playwright Official — Auth Docs | Canonical storageState patterns; multiple roles; worker isolation |
| 2 | grafana-e2e (30+ projects) | Production RBAC exemplar; role-based project architecture |
| 3 | grafana-plugin-e2e | HTTP API user provisioning; RBAC per-role storageState |
| 4 | supabase-e2e | REST API auth; session in localStorage |
| 5 | calcom-e2e | E2E toggle; .env.e2e.example; setup project |
| 6 | DEV Community (Vitalets) — On-Demand Auth | globalCache.get() for shard-efficient auth |
| 7 | Tim Deschryver — Auth Revamped | Fixture-based auth; modern patterns |
| 8 | Ministry of Testing — Auth Recipes | Comprehensive cookbook: SSO, MFA, sessions |
| 9 | Clerk Docs — Playwright Testing | Third-party auth provider integration |
| 10 | Neova Solutions — Multi-User Auth | Role switching in single suite |
| 11 | TestLeaf — Storage State Roles | Reuse login for multiple users |
| 12 | Medium (Divya Kandpal) — Multi-User Testing | Multiple users without repeated login |
| 13 | Ministry of Testing Discussions | Community patterns for multi-user workflows |
| 14 | playwright-bdd Issue #185 | Testing multiple roles in BDD context |
| 15 | Netizens Report — Auth Best Practices | Secure credential handling patterns |
| 16 | WooCommerce Issue #44638 | Enterprise: extending E2E tests with security scans |

## Auth State Management Patterns Compared

| Pattern | How It Works | Pros | Cons | Best For |
|---------|-------------|------|------|----------|
| Setup project + storageState | Dedicated auth project runs first; saves state to .auth/*.json | Visible in reports; debuggable; official recommendation | One-time setup; all roles authenticated even if not needed | Most teams |
| On-demand fixture + globalCache | Fixture calls globalCache.get(role); authenticates only when needed | Shard-efficient; lazy evaluation | Newer API; less documented | Large sharded suites |
| REST API auth in beforeAll | Direct HTTP login call in beforeAll; saves storageState | Fast; no UI dependency | Not visible in reports; manual state management | API-heavy apps |
| globalSetup function | globalSetup.ts runs once before all tests | Simple for single role | Not debuggable; no trace/report; no fixtures | Legacy / simple apps |
| Per-test login (no reuse) | Each test logs in via UI | Fully isolated | Extremely slow; UI flakiness in auth | Only if auth IS the test |

## Maturity Assessment: Production-Ready vs. Experimental

| Pattern/Technique | Maturity Level | Production-Ready? |
|-------------------|---------------|-------------------|
| storageState for auth persistence | Stable | Yes — official pattern |
| Setup projects for auth | Stable | Yes — official recommendation |
| REST API authentication | Stable | Yes — 3/10 Gold suites |
| globalCache.get() for on-demand auth | Stable | Yes — documented, Playwright API |
| Per-role storageState files | Stable | Yes — Grafana exemplar |
| Multi-role projects in config | Stable | Yes — Grafana exemplar |
| HTTP API user provisioning | Stable | Yes — Grafana plugin tools |
| TOTP MFA generation | Documented | Conditional — requires secret management |
| Cookie attribute validation | Documented | Yes — uses stable Playwright APIs |
| HTTP security header testing | Documented | Yes — uses stable Playwright APIs |
| CSRF token testing | Documented | Yes — uses stable Playwright APIs |
| XSS payload injection | Documented | Conditional — limited without scanner |
| OWASP ZAP proxy integration | Experimental | No — not standardized, low adoption |
| Vault integration (HashiCorp, AWS, Azure) | Documented | Conditional — requires infra |
| CSP validation testing | Documented | Yes — uses stable Playwright APIs |
| Security regression testing | Emerging | Conditional — custom implementation |
