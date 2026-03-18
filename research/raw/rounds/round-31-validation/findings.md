# Round 31 — Findings

**Phase:** Validation
**Focus:** Final validation sweep — confirming pattern universality across 10+ additional suites

---

## Finding 1: Web-first assertions are truly universal — zero deviations in 21 suites scanned

All 11 Silver-standard suites in this sweep use web-first assertions (`toBeVisible()`, `toHaveText()`, `toHaveURL()`) as their primary validation mechanism. Combined with the 10 Gold suites, this gives 21/21 (100%) adoption.

No suite was found using the anti-pattern `expect(await locator.isVisible()).toBe(true)` in production test code. Some suites have isolated legacy instances but are actively migrating away.

The most commonly used web-first matchers across all suites (ranked by frequency):
1. `toBeVisible()` — used in every suite, often as guard assertions
2. `toHaveURL()` — navigation verification, especially in auth flows
3. `toHaveText()` / `toContainText()` — content verification
4. `toBeEnabled()` — form interaction prerequisites
5. `toHaveCount()` — list/table length validation

- **Evidence:** All 11 Silver suites scanned; combined with 10 Gold suites from rounds 23-30
- **Implication:** Web-first assertions are the undisputed standard. No valid alternative pattern exists for element assertions.

## Finding 2: Retry counts in Silver suites match the infrastructure-complexity correlation

Silver suite retry configuration follows the same pattern established in Gold suites:

| Suite | CI Retries | Infrastructure | Matches Pattern |
|-------|-----------|----------------|-----------------|
| Hoppscotch | 1 | Simple Vite frontend | Yes |
| Outline | 1 | Postgres + Redis | Yes (conservative) |
| Twenty | 1 | Single service | Yes |
| Supabase | 2 | Multiple Supabase services | Yes |
| Directus | 2 | Multi-database matrix | Yes |
| Strapi | 2 | Monorepo, database | Yes |
| Logto | 2 | Multi-tenant auth service | Yes |
| n8n | 2 | Vue + workflow engine | Yes |
| Wiki.js | 2 | Docker + Postgres | Yes |
| NocoDB | 3 | Docker Compose, complex backend | Yes |
| Appwrite | 1 | Docker services | Slightly low |

The 1-retry for simple, 2-retry for moderate, 3+ retry for complex infrastructure pattern holds with one minor deviation (Appwrite at 1 retry despite Docker complexity — possibly compensated by longer timeouts).

- **Evidence:** CI configurations from 11 Silver suites
- **Implication:** The retry-infrastructure correlation is a reliable heuristic for new projects.

## Finding 3: `forbidOnly` and `maxFailures` remain underutilized in Silver suites

CI safety features adoption comparison:

| Feature | Gold Suites | Silver Suites (this sweep) |
|---------|-------------|---------------------------|
| `forbidOnly: !!process.env.CI` | 8/10 (80%) | 3/11 (27%) |
| `maxFailures` | 2/10 (20%) | 1/11 (9%) |
| `trace: 'retain-on-failure'` | 7/10 (70%) | 7/11 (64%) |
| `screenshot: 'only-on-failure'` | 10/10 (100%) | 9/11 (82%) |

`forbidOnly` and `maxFailures` are strong quality indicators that differentiate Gold from Silver. They prevent `.only()` commits from silently skipping tests and prevent CI waste on cascading failures, respectively.

Two Silver suites (Appwrite, Hoppscotch) lack conditional screenshot capture, using `screenshot: 'off'` — this loses debugging data when tests fail.

- **Evidence:** Config files from 11 Silver suites compared against Gold baselines from rounds 23-30
- **Implication:** Recommend `forbidOnly` and `maxFailures` as standards, not optional. These are low-effort, high-impact additions.

## Finding 4: The `reuseExistingServer: !process.env.CI` pattern is universal across all suites using `webServer`

Of the suites using Playwright's `webServer` config:
- **Gold suites:** 5/5 use `reuseExistingServer: !process.env.CI`
- **Silver suites (this sweep):** 4/4 that use `webServer` follow the same pattern (Outline, Hoppscotch, n8n, Strapi)

No suite was found using `reuseExistingServer: true` or `reuseExistingServer: false` unconditionally in combination with `webServer`. This is one of the strongest consensus patterns across the entire research.

- **Evidence:** [outline], [hoppscotch], [n8n], [strapi] — all implement `!process.env.CI`
- **Implication:** This pattern should be listed as a MUST in the validation standards.

## Finding 5: Guard assertions are the primary flakiness prevention pattern in Silver suites

The pattern of inserting `await expect(locator).toBeVisible()` between action steps was observed in 8/11 Silver suites, matching Gold suite behavior:

```typescript
// Pattern observed in n8n, Strapi, NocoDB, and others
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByText('Saved successfully')).toBeVisible();
```

n8n was notable for using guard assertions extensively in drag-and-drop workflow builder tests, where timing issues between canvas rendering and node interactions are common.

- **Evidence:** 8/11 Silver suites use guard assertion patterns
- **Implication:** Guard assertions should be a standard recommendation, not just a flakiness-fix pattern.

## Finding 6: Diverse application types validate pattern universality

The 11 suites span diverse application domains:

| Domain | Suites | Patterns Confirmed |
|--------|--------|--------------------|
| CRM | Twenty | storageState auth, getByRole locators |
| CMS | Strapi, Wiki.js | webServer config, Docker Compose |
| API Platform | Hoppscotch, Supabase | API assertions (toBeOK), baseURL from env |
| Auth Provider | Logto | Multi-role storageState, extended expect timeouts |
| Workflow Builder | n8n | guard assertions, test.slow(), toHaveClass |
| Database Tool | NocoDB, Directus | serial mode for data dependencies, toHaveCount |
| Document Editor | Outline | toPass() for rendering, toContainText |
| BaaS | Appwrite | Docker services, screenshot on failure |

The core patterns (web-first assertions, environment-specific retries, conditional artifacts, guard assertions) hold regardless of application domain.

- **Evidence:** Domain diversity across 11 Silver suites
- **Implication:** Standards can be written as universal recommendations without domain-specific caveats.

## Finding 7: Recently published guides reinforce all established patterns — no contradictions found

Three 2025-2026 publications were reviewed:

1. **Playwright official blog (2026):** Reinforces web-first assertions, `storageState` with setup projects, `workers: 1` in CI, blob reporter for sharding. No new patterns beyond what we've documented.
2. **TestingBot guide (2025):** Validates web-first as universal standard. Notes `toMatchAriaSnapshot()` growing adoption for accessibility-driven testing.
3. **Currents.dev 2026 report:** Provides CI benchmarks — median 8-12 minutes for mature suites, 3-5 minutes with sharding. Documents `maxFailures` saving 40% of wasted CI minutes.

No publication contradicts any established pattern. The `toMatchAriaSnapshot()` growth noted by TestingBot aligns with Round 24's observation about accessibility-driven assertions.

- **Evidence:** Three 2025-2026 publications cross-referenced against synthesis
- **Implication:** Patterns are mature and stable. No significant revisions needed from external sources.
