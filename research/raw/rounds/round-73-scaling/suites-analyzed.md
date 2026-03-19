# Round 73 — Suites Analyzed

## Primary Analysis

### 1. WordPress/Gutenberg (`wordpress/gutenberg`)
- **Package analyzed:** `packages/e2e-test-utils-playwright/src/` (62 files)
- **Focus:** Published npm package architecture, export surface, fixture pre-wiring
- **Key finding:** 8-module barrel export with pre-wired fixtures — the most extreme form of test infrastructure as a shared library. Includes Lighthouse and metrics modules for performance testing.

### 2. n8n (`n8n-io/n8n`)
- **Directory analyzed:** `packages/testing/playwright/` (full tree)
- **Focus:** 5-layer fixture architecture, composables pattern, dynamic project generation
- **Key finding:** Composables layer above POMs is unique — orchestrates multi-page workflows. Dynamic project generation based on infrastructure topology (sqlite/postgres × single/multi-main).

### 3. Ghost CMS (`TryGhost/Ghost`)
- **Directory analyzed:** `ghost/core/test/e2e-browser/` (structure + README)
- **Focus:** Multi-app test distribution, describe-level instance isolation
- **Key finding:** Describe-level Ghost instance creation (coarser than per-worker). Tests built from repo root to ensure all apps are locally compiled.

### 4. Element Web (`element-hq/element-web`)
- **Sources analyzed:** Config references, CI workflow patterns, docs
- **Focus:** Container-per-worker isolation, crypto project variants
- **Key finding:** CI-level browser matrix (not config-level), container-per-worker Synapse instances for state isolation

## Cross-Reference Data

### 5. Grafana (`grafana/grafana`)
- **Focus:** Config helpers (`withAuth()`, `baseConfig`), project-level fixture injection
- **Cross-referenced from:** Round 72 config analysis

### 6. Rocket.Chat (`RocketChat/Rocket.Chat`)
- **Focus:** Shallow fixture investment (POM-only), correlation with long test bodies
- **Cross-referenced from:** Round 62 landscape analysis
