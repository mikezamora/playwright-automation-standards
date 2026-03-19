# Round 77 Findings: Drafting TA4-TA6

## Methodology

Drafted standards TA4 (Setup Placement), TA5 (Assertion Patterns), and TA6 (Test Independence & Determinism) based on synthesis from anatomy-patterns.md, round-63 audit-notes.md, round-66 assertion findings, and round-67 independence/nesting findings.

---

## Drafting Decisions

### TA4: Setup Placement (4 sub-standards)

**TA4.1 — Five-tier decision framework:** Organized the 9 setup approaches from anatomy-patterns.md into 5 tiers ordered by complexity (navigation-only through rich fixture composition). This collapses overlapping approaches into a decision-friendly hierarchy. Evidence maps each tier to specific suites.

**TA4.2 — Fixtures over beforeEach:** Made this a dedicated sub-standard based on the strong community consensus (Playwright docs, Semantive, Checkly) and production evidence (7/15 suites use fixtures as dominant setup). Noted the common pattern of using BOTH fixtures (cross-file) and beforeEach (file-specific navigation).

**TA4.3 — beforeAll for read-only resources:** Added a constraint that beforeAll shared resources must be read-only to be safe. Cited the Grafana/Immich pattern (safe: tests read shared dashboards) vs Rocket.Chat pattern (unsafe: tests mutate shared channels).

**TA4.4 — Cleanup matches setup:** Created a cleanup pattern table mapping each cleanup mechanism to setup tiers. Included the Supabase async disposable pattern as an advanced option. Noted that Tier 1-2 setups (Slate, Excalidraw) need no cleanup.

### TA5: Assertion Patterns (6 sub-standards)

**TA5.1 — Target 2-8 assertions:** Set the range based on cross-suite average of 3.2 (excluding CUJ). Used "2-8" as the recommended range rather than "3-5" to accommodate variation across test types while excluding CUJ outliers.

**TA5.2 — Archetype-dependent density:** Created the archetype density table from round-66 data (smoke 1-2, CRUD 3-5, workflow 5-8, CUJ 10-20+). Explicitly rejected the "one assertion per test" dogma as a unit testing rule that does not transfer to E2E.

**TA5.3 — Guard assertions:** Positioned as "rely on auto-waiting by default, explicit guards only for ambiguous state" based on the finding that only 2/15 suites use explicit guards. This was a deliberate choice to NOT recommend guard assertions as a general practice.

**TA5.4 — Assertion ordering:** Codified the implicit navigation-state-interaction-outcome sequence observed across suites. This is descriptive (documenting what suites do) rather than prescriptive.

**TA5.5 — Soft assertions for CUJ:** Made this conditional on CUJ tests with 10+ assertions based on Grafana being the only production user (1/15). Included the mixed hard/soft pattern where guards use hard `expect()` and checkpoints use `expect.soft()`.

**TA5.6 — Web-first assertions exclusively:** Strongest recommendation in TA5 — "MUST use" language. All 15 suites and Playwright official docs agree. Included the common assertion type frequency table.

### TA6: Test Independence & Determinism (5 sub-standards)

**TA6.1 — Independence is non-negotiable:** Used MUST language. 14/15 suites achieve this. Only Rocket.Chat fails the test. Cited Playwright official docs directly.

**TA6.2 — Avoid serial for state sharing:** Separated serial-for-state-sharing (anti-pattern) from serial-for-other-reasons (acceptable). Included the distribution table showing only 1/15 suites uses serial for state sharing. Added the freeCodeCamp/Gutenberg workers:1 data as implicit serial.

**TA6.3 — Data isolation approaches:** Created the 9-approach decision table from anatomy-patterns.md. Noted that 3/15 suites need no isolation (stateless), while 5/15 require full-stack isolation. Avoided recommending a single approach — the right choice depends on architecture.

**TA6.4 — Determinism patterns:** Covered seeded randoms (2/15), unique identifiers (3/15), feature toggle control (2/15), and version-conditional skipping (2/15). Included code examples for each. Made seeded random a MUST for tests involving randomness.

**TA6.5 — Describe nesting max depth 2:** Originally proposed as TA6 in the audit notes, merged into TA6 as sub-standard TA6.5 per the audit recommendation. Included the compensating mechanism analysis (directory depth + describe depth = 3-4 total). Noted Next.js's deeper nesting (3-4) is data-driven via describe.each, which is acceptable.

## Evidence Gaps

- Soft assertions (TA5.5): Only 1/15 suites use them. The recommendation is based more on Playwright's official guidance than production evidence. Flagged for validation in rounds 82-83.
- Async disposable cleanup (TA4.4): Only Supabase uses the TC39 pattern. Too new to be a primary recommendation but included as valid approach.

## Key Design Choices

1. **TA6 absorbed the proposed TA6 (Describe Nesting):** Per audit-notes.md recommendation, describe nesting depth was merged into TA6 as sub-standard TA6.5 rather than becoming a separate standard. The nesting question is part of the broader independence and organization concern.

2. **TA4 absorbed cleanup patterns:** Per audit-notes.md suggestion of a separate TA7 for cleanup, opted to include cleanup as TA4.4 within Setup Placement since cleanup is inherently coupled to setup. A separate standard would have created cross-references without adding clarity.

3. **Total sub-standards: 25 across TA1-TA6.** This is higher than the 6-7 per section in structure-standards.md, but each sub-standard addresses a distinct decision point with its own evidence.
