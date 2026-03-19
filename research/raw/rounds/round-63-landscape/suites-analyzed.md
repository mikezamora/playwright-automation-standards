# Round 63 — Master Suite Table (Rounds 56-62)

## All Suites Analyzed in Landscape Phase (Rounds 56-62)

### Gold-Tier Suites Re-Analyzed (Rounds 56-59)

| # | Suite | Repository | Stars | Framework | Spec Files | Est. Tests | CI Shards | Round |
|---|-------|-----------|-------|-----------|-----------|------------|-----------|-------|
| 1 | Grafana | grafana/grafana | ~72,700 | Playwright | ~163 | ~350-450 | 8 | R56 |
| 2 | Cal.com | calcom/cal.com | ~38,700 | Playwright | ~83 | ~250-350 | 8 | R56 |
| 3 | AFFiNE | toeverything/AFFiNE | ~57,000 | Playwright | ~120+ | ~500+ | 12 | R57 |
| 4 | Immich | immich-app/immich | ~61,000 | Playwright + Vitest | ~45+ | ~300-400 | 0 (2 arch) | R57 |
| 5 | freeCodeCamp | freeCodeCamp/freeCodeCamp | ~414,000 | Playwright | 117 | ~400-600 | 0 | R57 |
| 6 | Excalidraw | excalidraw/excalidraw | ~118,900 | Vitest + RTL | ~33 | ~300+ | 0 | R58 |
| 7 | Slate | ianstormtaylor/slate | ~30,800 | Playwright | 22 | ~35 | 0 | R58 |
| 8 | Supabase Studio | supabase/supabase | ~99,000 | Playwright | 18 | ~177 | 2 | R58 |
| 9 | Next.js | vercel/next.js | ~132,000 | Custom (Jest+PW) | ~550+ dirs | ~5,000-10,000 | ~190-200 jobs | R59 |
| 10 | Grafana plugin-e2e | grafana/plugin-tools | ~400 | Playwright | ~25 | ~50-60 | 0 (version matrix) | R59 |

### New Large-Scale Suites Discovered (Round 60) and Analyzed (Round 62)

| # | Suite | Repository | Stars | Spec Files | Scale Tier | Deep Analyzed | Round |
|---|-------|-----------|-------|-----------|------------|---------------|-------|
| 11 | WordPress/Gutenberg | wordpress/gutenberg | ~11,600 | 278 | Mega | Yes (R62) | R60/R62 |
| 12 | Element Web | element-hq/element-web | ~12,900 | 209 | Mega | Yes (R62) | R60/R62 |
| 13 | Rocket.Chat | RocketChat/Rocket.Chat | ~44,955 | 170 | Large | Yes (R62) | R60/R62 |
| 14 | n8n | n8n-io/n8n | ~180,014 | 174 | Large | Yes (R62) | R60/R62 |
| 15 | Ghost CMS | TryGhost/Ghost | ~52,098 | 81 (browser) / 199 (all e2e) | Medium | Yes (R62) | R60/R62 |

### New Suites Cataloged but Not Deep-Analyzed

| # | Suite | Repository | Stars | Spec Files | Scale Tier | Round |
|---|-------|-----------|-------|-----------|------------|-------|
| 16 | Shopware | shopware/shopware | ~3,290 | 94 | Large | R60 |
| 17 | Mattermost | mattermost/mattermost | ~35,887 | 89 | Large | R60 |
| 18 | Documenso | documenso/documenso | ~12,516 | 82 | Large | R60 |
| 19 | Saleor Dashboard | saleor/saleor-dashboard | ~988 | 38 | Medium | R60 |
| 20 | SvelteKit | sveltejs/kit | ~20,364 | 18 (21 configs) | Framework | R60 |

### Coverage Strategy Resources (Round 61)

| # | Resource | Type | Key Finding |
|---|----------|------|-------------|
| 21 | Grafana (tiering) | Production suite | Best example of structural tier organization |
| 22 | RocketChat e2e-playwright | Production suite | Most mature tag taxonomy (smoke, sanity, critical, slow) |
| 23 | Finnish Gov (Opetushallitus) | Production suite | Smoke projects targeting QA + production environments |
| 24 | German Gov (digitalservicebund) | Production suite | Smoke project targeting staging with basic auth |
| 25 | feature-map (npm) | Tool | Only dedicated feature coverage tracking tool |
| 26-30 | Various coverage tools | Tools | playwright-coverage, nextcov, Checkly, Testomat.io |
| 31-47 | Community guides | Guidance | 17 resources on coverage strategy, tags, CI tiers, measurement |

## Totals

| Category | Count |
|----------|-------|
| Suites deep-analyzed (three lenses) | 15 |
| Suites cataloged (not deep-analyzed) | 5 |
| Coverage strategy resources | 30 |
| Total rounds | 7 (R56-R62) + 1 synthesis (R63) |
| Total spec files across deep-analyzed suites | ~2,000+ |
| Total estimated tests | ~10,000-15,000+ |
