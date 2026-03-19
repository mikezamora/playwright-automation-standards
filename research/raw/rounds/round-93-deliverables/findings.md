# Round 93 — Deliverables: Section Guides

**Phase:** Deliverables
**Focus:** Create section guides for test anatomy, coverage strategy, and scaling
**Date:** 2026-03-19

---

## What Was Created

### Section Guides (3 new files)

1. **`templates/section-guides/test-anatomy-guide.md`** (~200 lines)
   - Covers AAA pattern with Playwright code examples
   - When to split vs use `test.step()` — reserved for CUJ tests only
   - Setup placement decision framework (inline < beforeEach < fixture < factory)
   - Assertion ordering: guard -> action -> outcome
   - Test length target: <30 lines average
   - References TA1.1-TA6.2

2. **`templates/section-guides/coverage-guide.md`** (~200 lines)
   - E2E boundary decision framework (Must-have / Should-have / Rarely-at-E2E table)
   - Coverage tiers: Smoke, Regression, Comprehensive, Nightly
   - Structural tiering via directories as the standard, NOT tags
   - Growth order: auth -> core CRUD -> navigation -> settings -> edge cases
   - Error-path target: 10-20% of E2E tests
   - References COV1.1-COV5.2

3. **`templates/section-guides/scaling-guide.md`** (~200 lines)
   - Scale tiers: Small (1-50), Medium (50-200), Large (200-1000), Enterprise (1000+)
   - Transition playbooks per boundary with specific triggers and actions
   - Directory restructuring thresholds and examples
   - Config composition patterns for each tier
   - Fixture governance for multi-team environments
   - Execution strategy per tier (PR/merge/nightly)
   - References S8.1-S12.6

### Format Consistency

All three guides follow the established format from `assertions-guide.md`:
- Header with reference links to standards documents
- Purpose and Goals section
- Key Standards section with code examples
- Common Pitfalls table
- When to Deviate section with evidence-based exceptions
