# Round 80 — Drafting S8-S10 (Scale Tiers, Directory Scaling, Configuration Scaling)

**Phase:** Drafting — Scaling Standards
**Date:** 2026-03-19
**Focus:** Draft S8, S9, and S10 standards based on evidence from rounds 72-75

---

## Drafting Basis

### S8: Scale Tiers & Transition Triggers

**Evidence sources:** Rounds 72-75 (15 production suites analyzed)

**Key evidence applied to standard:**
- Four tiers confirmed across 15 suites: Small (<50), Medium (50-200), Large (200-1000), Enterprise (1000+)
- Tier boundaries refined from round 75 audit to include 1000-5000+ as Enterprise upper range
- Transition triggers documented with specific suite evidence at each boundary
- Pain points matrix drawn from both positive exemplars (Grafana, n8n) and negative exemplars (Rocket.Chat, freeCodeCamp flat structure)

**Drafting decisions:**
- S8.1: Four tiers with concrete test-count ranges and CI-duration correlates
- S8.2: Transition trigger matrix with measurable thresholds
- S8.3: Pain points at each boundary with root causes and fixes
- S8.4: Decision tree for tier identification

### S9: Directory & File Scaling

**Evidence sources:** Rounds 72-74 (12/15 suites provide structural data)

**Key evidence applied to standard:**
- Flat-to-nested threshold: 20-30 files (Grafana, Cal.com evidence)
- Sub-feature splitting: 10-15 specs per directory (Grafana dashboards-suite, n8n categories)
- Spec file splitting: 200 lines or 10 tests (Grafana 3-8 tests/file, n8n 4-6 tests/file as positive exemplars)
- 1:1 directory-to-project mapping (Grafana 30/30 match)
- Anti-patterns: freeCodeCamp 126 flat files, Rocket.Chat 75 flat specs

**Drafting decisions:**
- S9.1: Flat-to-nested restructuring with threshold and evidence
- S9.2: Sub-feature directory splitting trigger
- S9.3: Spec file size limits
- S9.4: Directory-to-project naming alignment
- S9.5: Cross-feature test placement guidance
- S9.6: Monorepo patterns

### S10: Configuration Scaling

**Evidence sources:** Rounds 72-74 (all 15 suites provide config data)

**Key evidence applied to standard:**
- Three confirmed approaches: config-level (Grafana), CI-level (Next.js), hybrid/dynamic (n8n)
- Grafana proves 30 projects in one config is maintainable with helpers
- Next.js proves CI-level orchestration works at 84 shards
- n8n proves dynamic project generation via separate projects file
- Config DRY patterns: withAuth(), baseConfig spreading, separate projects file

**Drafting decisions:**
- S10.1: Config-level orchestration (Grafana model)
- S10.2: CI-level orchestration (Next.js model)
- S10.3: Dynamic project generation (n8n model)
- S10.4: Config DRY helper patterns
- S10.5: When single config becomes unwieldy

---

## Cross-References to Existing Standards

| New Standard | Extends/Refines | Relationship |
|---|---|---|
| S8 (Scale Tiers) | S2.3 (Multi-project config) | S8 provides scale context for project count guidance |
| S9 (Directory Scaling) | S1.5 (Feature-based directories) | S9 adds threshold triggers to S1.5's recommendation |
| S9 (Directory Scaling) | S5.1 (Feature grouping) | S9 adds file-count triggers |
| S10 (Config Scaling) | S2.3 (Multi-project config) | S10 extends S2.3 to enterprise scale |
| S10 (Config Scaling) | S2.2 (Environment-aware config) | S10 adds CI orchestration patterns |
