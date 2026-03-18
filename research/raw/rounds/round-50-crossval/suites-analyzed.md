# Round 50 — Suites & Sources Analyzed: Negative Case Analysis

## Scope

Find lower-quality or abandoned Playwright suites and validate that our standards correctly identify their weaknesses. Test whether the quality criteria (Q1-Q5) and anti-pattern lists effectively distinguish quality levels.

## Sources Consulted

| # | Source | Quality Level | Last Active | Key Issues |
|---|--------|--------------|-------------|------------|
| 1 | ovcharski/playwright-e2e | Bronze (boilerplate) | 2024 | BasePage inheritance, hardcoded data, CSS selectors |
| 2 | ISanjeevKumar/playwright-e2e-tests | Bronze (boilerplate) | 2023 | POM inheritance, type-based directories, JS config |
| 3 | m-pujic-levi9-com/playwright-e2e-tests | Bronze (boilerplate) | 2024 | Over-engineered config, unnecessary abstractions |
| 4 | ugioni/playwright-e2e | Bronze (minimal) | 2023 | Minimal tests, no CI, no structure |
| 5 | ecureuill/saucedemo-playwright | Bronze (tutorial) | 2023 | Tutorial-quality, hardcoded selectors, no fixtures |
| 6 | documenso/documenso (flaky state) | Silver (degraded) | 2026 | Active but with known flakiness (#2227), waitForTimeout |
| 7 | WooCommerce (legacy patterns) | Silver (legacy) | 2026 | Active but carries Puppeteer migration debt |
| 8 | rishivajre/Playwright-E2E-Framework | Bronze (enterprise template) | 2024 | Over-abstracted, Excel data-driven, unnecessary layers |
| 9 | Community templates (various) | Bronze | Various | Common patterns from boilerplate repos |
| 10 | Abandoned GitHub repos (playwright-tests topic) | Bronze/Inactive | 2022-2023 | Repos with initial commits but no follow-through |

## Evaluation Framework

Each suite evaluated against:
1. **Anti-pattern checklist** — Do our documented anti-patterns catch their issues?
2. **Quality tier criteria** — Does Q1.2 (Gold criteria) correctly exclude them?
3. **Maturity spectrum** — Does the maturity spectrum correctly classify them?
4. **Standards diagnostic value** — Could someone use our standards to identify and fix the issues?
