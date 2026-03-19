# Round 81 — Drafting S11-S12 (Fixture Scaling, Execution Strategy)

**Phase:** Drafting — Scaling Standards
**Date:** 2026-03-19
**Focus:** Draft S11 and S12 standards based on evidence from rounds 72-75

---

## Drafting Basis

### S11: Fixture & Dependency Scaling

**Evidence sources:** Rounds 73-75 (8/15 suites provide detailed fixture data)

**Key evidence applied to standard:**
- Fixture depth inversely correlates with test length (n8n 5 layers / 10-30 line tests vs Rocket.Chat 2 layers / 30-80 line tests)
- Four scaling strategies: published package (WordPress), layered fixtures (n8n), factory pattern (Ghost), config helpers (Grafana)
- Composables layer (n8n) as emerging practice — single-source evidence, recommended with caveat
- Fixture tier segmentation: base.ts + cloud-only.ts (n8n)
- Published packages justified only for ecosystem platforms (WordPress)

**Drafting decisions:**
- S11.1: Fixture investment correlation with scale
- S11.2: Module boundary segmentation (base + environment-specific)
- S11.3: Composables layer as emerging practice
- S11.4: Published utility packages (ecosystem-only justification)
- S11.5: Circular dependency prevention

**Caveats applied:**
- Composables pattern marked as "emerging practice" (single-source: n8n)
- Published package pattern explicitly scoped to ecosystem platforms only
- Limited data on fixture deprecation/cleanup at scale acknowledged

### S12: Execution Strategy at Scale

**Evidence sources:** Rounds 72-75 (15/15 suites provide execution data)

**Key evidence applied to standard:**
- Five execution stages confirmed with evidence at each stage
- Sharding formula: ceil(testCount / 40) validated against Supabase (177/2 = 88/shard)
- Serial execution anti-pattern strongly confirmed (Rocket.Chat 170 specs/1 worker, WordPress 278 specs/1 worker)
- Selective execution patterns: --only-changed (v1.46+), tag-grep mapping, file-path filtering
- Tiered execution adoption gap: only 2/15 suites implement despite need at 200+ tests

**Drafting decisions:**
- S12.1: Five execution stages with triggers
- S12.2: Sharding formula and fullyParallel requirement
- S12.3: Serial execution anti-pattern
- S12.4: Tiered execution approaches
- S12.5: Selective execution patterns
- S12.6: CODEOWNERS for test directories

---

## Cross-References to Existing Standards

| New Standard | Extends/Refines | Relationship |
|---|---|---|
| S11 (Fixture Scaling) | S4.1 (Custom fixtures) | S11 adds scaling guidance to S4's fixture patterns |
| S11 (Fixture Scaling) | S4.2 (Fixture scoping) | S11 extends scoping to environment-tier segmentation |
| S11 (Fixture Scaling) | S4.3 (Fixture composition) | S11 adds composables layer above mergeTests |
| S12 (Execution Strategy) | C1.1 (CI pipeline) | S12 refines sharding guidance with formula |
| S12 (Execution Strategy) | C3.1 (Docker) | S12 adds container-per-worker as scaling pattern |
| S12 (Execution Strategy) | V4.1 (Flakiness) | S12 connects flakiness to execution stage transitions |

---

## Contradictions Resolved

### Workers Count

**Existing guidance (S2.2):** Use CI-specific workers (`workers: process.env.CI ? 4 : undefined`)
**New finding:** Optimal workers depend on test isolation quality. Suites with poor isolation use 1 worker by necessity.
**Resolution in S12:** Workers should default to CI core count when tests are properly isolated. The 1-worker pattern indicates an isolation problem, not a configuration choice. S12.3 explicitly calls this out as an anti-pattern.

### Tag-Based vs Structural Organization

**Existing guidance (S5.2):** Use @tags for cross-cutting categorization.
**New finding:** 0/15 production suites use priority tags. All use structural organization.
**Resolution in S12:** Structural tiering (project/directory) preferred over tag-based tiering for execution strategy. Tags remain valid for ad-hoc filtering per S5.2, but should not be the primary mechanism for smoke/regression tier selection.
