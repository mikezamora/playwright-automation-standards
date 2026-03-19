# Round 60 — Suites Analyzed

## New Production Playwright Suites Discovered

| Suite | GitHub URL | Stars | Playwright Test Files | Scale Tier | Why Interesting |
|-------|-----------|-------|----------------------|------------|-----------------|
| WordPress/Gutenberg | https://github.com/WordPress/gutenberg | ~11,600 | 235 spec.js (e2e) + 8 storybook + perf tests | Mega | Largest new suite; reusable `@wordpress/e2e-test-utils-playwright` npm package; 3 separate Playwright configs (e2e, storybook, performance); Puppeteer-to-Playwright migration; browser-specific grep filtering; custom flaky-tests-reporter |
| Element Web | https://github.com/element-hq/element-web | ~12,900 | 138 e2e + 71 snapshot = 209 spec.ts | Mega | End-to-end encrypted messaging testing (Matrix protocol); 48 test categories; massive visual regression suite; crypto key verification; read-receipt testing depth (18 files); federation testing |
| Rocket.Chat | https://github.com/RocketChat/Rocket.Chat | ~44,955 | 159 spec.ts | Large | Enterprise messaging; federation testing; omnichannel/customer-support flows; VoIP/video testing; SAML/OAuth enterprise auth; role-based selectors; flat file organization |
| n8n | https://github.com/n8n-io/n8n | ~180,014 | 157 spec.ts | Large | Most sophisticated fixture architecture found; tag-based infrastructure selection (@mode, @capability, @licensed, @chaostest); composables pattern; container-scoped isolation (worker vs test); chaos engineering tests; 51 workflow spec files |
| Shopware | https://github.com/shopware/shopware | ~3,290 | 94 spec.ts | Large | E-commerce acceptance testing; visual regression as largest category (24 files); pagespeed testing; install/update testing; separate reusable acceptance-test-suite package |
| Mattermost | https://github.com/mattermost/mattermost | ~35,887 | 89 spec.ts | Large | Accessibility-first locator strategy; 17 a11y spec files (WCAG 2.1 AA); Percy visual testing; Cypress-to-Playwright migration; mobile device projects (iPhone, iPad); shared library pattern; CLAUDE.OPTIONAL.md AI agent guidance |
| Documenso | https://github.com/documenso/documenso | ~12,516 | 82 spec.ts | Large | Document signing workflows; combined API + UI E2E testing; versioned API tests (v1, v2, trpc); license/feature-flag testing; webhook testing; 21 feature areas |
| Ghost CMS | https://github.com/TryGhost/Ghost | ~52,098 | 53 e2e test files + 10 browser specs + 15 comments-ui | Medium | Smart per-file vs per-test isolation; database snapshot pattern; data factory; dual dev/build modes; environment recycling by config identity; Docker infra (MySQL, Redis, Mailpit) |
| Saleor Dashboard | https://github.com/saleor/saleor-dashboard | ~988 | 38 spec.ts | Medium | E-commerce dashboard; 3 Playwright projects (setup, e2e, apps-e2e); auth setup pattern; permission testing with dedicated singlePermissions/ dir; headless commerce admin |
| SvelteKit | https://github.com/sveltejs/kit | ~20,364 | 18 test files across 21 Playwright configs | Framework | Multi-config framework testing pattern; per-adapter test apps (Vercel, Netlify, Cloudflare, static); 21 isolated test contexts testing framework behavior |

## Suites Investigated But Below Threshold

| Suite | GitHub URL | Stars | Finding | Status |
|-------|-----------|-------|---------|--------|
| Twenty CRM | https://github.com/twentyhq/twenty | ~40,564 | 8 spec.ts files | Too small |
| SigNoz | https://github.com/signoz/signoz | ~26,164 | 9 spec.ts files | Too small |
| SolidStart | https://github.com/solidjs/solid-start | ~5,828 | ~5 test files | Too small |
| React Router | https://github.com/remix-run/react-router | ~56,317 | Has Playwright config but minimal test files found | Needs investigation |
| Nuxt | https://github.com/nuxt/nuxt | ~59,879 | Has Playwright config; test count unclear | Needs investigation |

## Suites Investigated — No Playwright Found

| Suite | GitHub URL | Stars | Testing Framework |
|-------|-----------|-------|-------------------|
| VS Code | https://github.com/microsoft/vscode | ~182,842 | Custom test framework (not Playwright) |
| Directus | https://github.com/directus/directus | ~34,523 | Not Playwright |
| Strapi | https://github.com/strapi/strapi | ~71,657 | Not Playwright |
| Outline | https://github.com/outline/outline | ~37,703 | Not Playwright |
| Plane | https://github.com/makeplane/plane | ~46,758 | Not Playwright |
| Hoppscotch | https://github.com/hoppscotch/hoppscotch | ~78,535 | Not Playwright |
| NocoDB | https://github.com/nocodb/nocodb | ~62,476 | Playwright tests removed from develop branch |
