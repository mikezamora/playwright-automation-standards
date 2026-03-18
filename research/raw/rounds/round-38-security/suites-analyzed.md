# Round 38 — Suites & Sources Analyzed: Security Testing Patterns (Part 2)

## Scope

Deeper search for credential management patterns, API security testing with Playwright request context, vault integrations, and MFA testing approaches. Cross-reference with Gold suites for evidence.

## Sources Analyzed

| # | Source | Type | URL | Focus |
|---|--------|------|-----|-------|
| 1 | Sajith Dilshan — Secure Credential Management | Blog | https://medium.com/@sajith-dilshan/secure-credential-management-in-playwright-0cf75c4e2ff4 | Credential isolation, rotation, env var patterns |
| 2 | BrowserStack — Environment Variables | Guide | https://www.browserstack.com/guide/playwright-env-variables | dotenv, multi-env config, CI injection |
| 3 | Hoop.dev — HashiCorp Vault + Playwright | Blog | https://hoop.dev/blog/how-to-configure-hashicorp-vault-playwright-for-secure-repeatable-access/ | Vault integration, temporary secrets, OIDC auth |
| 4 | Hoop.dev — AWS Secrets Manager + Playwright | Blog | https://hoop.dev/blog/how-to-configure-aws-secrets-manager-playwright-for-secure-repeatable-access/ | AWS SDK secret retrieval, CI export |
| 5 | Arron Dougan — Azure Key Vault | Blog | https://medium.com/kpmg-uk-engineering/integrating-your-playwright-tests-with-azure-key-vault-166f4c528427 | Azure DefaultAzureCredential, CI managed identity |
| 6 | Testers Talk — Azure DevOps Key Vault | Blog | https://medium.com/@testerstalk/how-to-read-azure-devops-ado-keyvault-secrets-in-playwright-automation-3808dbc8aa06 | ADO pipeline secret variable groups |
| 7 | M Habib — Vault + Playwright | Blog | https://medium.com/@mhabiib/securing-your-automation-workflow-with-vault-using-playwright-25742bbf43aa | HashiCorp Vault workflow automation |
| 8 | Mahtab Nejad — JWT Testing | Blog | https://medium.com/@mahtabnejad/testing-jwt-tokens-with-playwright-2002a8b64341 | JWT validation, expiry testing, claim verification |
| 9 | Emir Inanc — JWT Token Capture | Blog | https://medium.com/adessoturkey/automating-jwt-token-capture-with-playwright-a-real-world-solution-d06c2a88b260 | Intercepting JWT from network responses |
| 10 | Playwright — API Testing Docs | Docs | https://playwright.dev/docs/api-testing | APIRequestContext, extraHTTPHeaders, Bearer tokens |
| 11 | DZone — API Testing Guide | Blog | https://dzone.com/articles/playwright-api-testing-guide | API security patterns, request context configuration |
| 12 | BrowserStack — API Testing 2026 | Guide | https://www.browserstack.com/guide/playwright-api-test | API auth patterns, header injection |
| 13 | Momentic — API Testing Guide | Blog | https://momentic.ai/resources/the-ultimate-guide-to-playwright-api-testing-unifying-ui-and-backend-validation | Unified UI + API security validation |
| 14 | Neova Solutions — Multi-User Auth | Blog | https://www.neovasolutions.com/2024/11/14/handling-authentication-for-multiple-user-logins-in-playwright/ | Multiple login handling, role switching |
| 15 | Ministry of Testing — Auth Recipes | Blog | https://www.ministryoftesting.com/articles/simple-playwright-authentication-recipes-a-cookbook-for-software-testers | Auth cookbook: SSO, MFA, session management |
| 16 | Tim Deschryver — Auth Revamped | Blog | https://timdeschryver.dev/blog/revamped-authentication-with-playwright | Modern auth patterns, fixture-based auth |
| 17 | Clerk — Test Authenticated Flows | Docs | https://clerk.com/docs/guides/development/testing/playwright/test-authenticated-flows | Clerk auth testing, setup project pattern |
| 18 | Awesome Testing — Playwright MCP Security | Blog | https://www.awesome-testing.com/2025/11/playwright-mcp-security | MCP secrets management, least-privilege credentials |
| 19 | WooCommerce — Security Scan Issue #44638 | Issue | https://github.com/woocommerce/woocommerce/issues/44638 | Enterprise consideration: extending E2E with security scans |

## Credential Management Patterns Across Sources

| Pattern | Source Count | Gold Suite Evidence | Maturity |
|---------|-------------|--------------------|---------|
| Environment variables (process.env) | 15+ | 10/10 Gold suites | Production |
| .env files with dotenv | 10+ | calcom-e2e, immich-e2e | Production |
| .env.example templates | 5+ | calcom-e2e (.env.e2e.example) | Production |
| GitHub Secrets in CI | 10+ | grafana-e2e, calcom-e2e | Production |
| .auth/ in .gitignore | 5+ | grafana-e2e, grafana-plugin-e2e | Production |
| HashiCorp Vault | 3 | 0/10 | Documented |
| AWS Secrets Manager | 2 | 0/10 | Documented |
| Azure Key Vault | 3 | 0/10 | Documented |
| Least-privilege test users | 5+ | grafana-plugin-e2e | Best practice |
| Credential rotation | 2 | 0/10 | Aspirational |

## API Security Testing Coverage

| Pattern | Source Count | Gold Suite Evidence |
|---------|-------------|---------------------|
| Bearer token injection via extraHTTPHeaders | 8+ | grafana-plugin-e2e |
| JWT token extraction from login response | 4 | supabase-e2e |
| JWT claim/expiry validation | 2 | 0/10 |
| API key rotation testing | 1 | 0/10 |
| OWASP API Security Top 10 coverage | 2 | 0/10 |
