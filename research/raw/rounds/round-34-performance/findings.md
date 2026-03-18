# Round 34 — Findings: Load Testing, Network Simulation, Trace Analysis

## Key Finding 1: Artillery + Playwright is Production-Ready for Load Testing

Artillery's Playwright engine is **built-in** (no separate installation) and represents the most mature browser-based load testing integration available.

### Architecture
- Artillery orchestrates virtual users, each getting a Playwright `page` instance
- Test functions receive `(page, vuContext, events, test)` parameters
- `test.step()` enables named step timing: `browser.step.landing_page` histograms

### Auto-Instrumented Web Vitals
Artillery automatically injects Google's `web-vitals` library and captures:
- LCP, FCP, CLS, INP, TTFB, FID
- Format: `browser.page.<METRIC>.<page_url>.<aggregation>`

### Configuration
```yaml
config:
  target: https://example.com
  phases:
    - duration: 60
      arrivalRate: 5        # 5 new VUs per second
    - duration: 120
      arrivalRate: 20       # ramp to 20 VUs/sec
  engines:
    playwright:
      extendedMetrics: true
      trace:
        enabled: true
        maxConcurrentRecordings: 5
  processor: './flows.ts'

scenarios:
  - engine: playwright
    testFunction: userJourney
```

### Extended Metrics (when enabled)
- `browser.page.domcontentloaded`, `browser.page.dominteractive`
- `browser.memory_used_mb` (JS heap)
- `browser.http_requests`, `browser.page.codes.<status>`

### Scaling
- Local: single machine, multiple VUs
- Distributed: AWS Fargate or Azure ACI via Artillery Cloud
- Turbo Runner (Beta): 10x faster via automatic sharding

**Assessment: Production-ready.** Artillery + Playwright is the recommended path for browser-based load testing.

## Key Finding 2: k6 Browser Module — Emerging Alternative

Grafana's k6 browser module offers Playwright-compatible APIs for performance testing:

### Key Characteristics
- **Rough Playwright compatibility** — familiar APIs but not 100% parity (by design)
- Runs on Sobek (Go-based JS runtime), not Node.js
- Web Vitals (FCP, INP, TTFB) are core metrics
- **Hybrid testing model**: HTTP protocol tests for load + browser tests for Web Vitals
- Grafana Cloud integration for dashboarding

### Comparison: Artillery vs k6 for Playwright-Based Load Testing

| Aspect | Artillery + Playwright | k6 Browser |
|--------|----------------------|------------|
| Playwright Compatibility | Full (bundles actual Playwright) | Partial (inspired by, not identical) |
| Web Vitals | Auto-instrumented via web-vitals lib | Core component |
| Scaling | AWS Fargate, Azure ACI, local | Grafana Cloud, local |
| Script Reuse | Direct Playwright scripts | Requires migration/adaptation |
| Protocol Testing | No (browser-only) | Yes (hybrid HTTP + browser) |
| Maturity | Production-ready | Production-ready (browser module GA) |
| Ecosystem | Artillery Cloud | Grafana/Prometheus/Loki stack |

**Assessment:** k6 browser is better for teams already in the Grafana ecosystem. Artillery is better for teams reusing existing Playwright scripts.

## Key Finding 3: Network Throttling via CDP (No Built-in API)

Playwright does **not** have a built-in network throttling API (confirmed by Issues #8622, #29155, #32618). The recommended approach uses CDP:

```typescript
const client = await page.context().newCDPSession(page);
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (50 * 1024) / 8,    // 50 Kbps
  uploadThroughput: (20 * 1024) / 8,       // 20 Kbps
  latency: 400,                             // 400ms
  connectionType: 'cellular3g'
});
```

### Standard Network Presets

| Preset | Download | Upload | Latency | connectionType |
|--------|----------|--------|---------|----------------|
| Slow 3G | 50 Kbps | 20 Kbps | 400ms | cellular3g |
| Fast 3G | 180 Kbps | 45 Kbps | 150ms | cellular3g |
| Slow 4G | 200 Kbps | 50 Kbps | 150ms | cellular4g |
| Regular 4G | 4 Mbps | 3 Mbps | 20ms | cellular4g |
| WiFi | 30 Mbps | 15 Mbps | 2ms | wifi |

### Alternative: page.route() with Delays

```typescript
await page.route('**/*', async (route) => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
  await route.continue();
});
```

**Limitation:** Only adds latency; does not throttle bandwidth. CDP is superior for realistic simulation.
**Limitation:** CDP approach is Chromium-only.

### CPU Throttling via CDP

```typescript
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // 4x slowdown
```

## Key Finding 4: Playwright Trace Viewer for Performance Analysis

The Trace Viewer provides performance analysis capabilities beyond debugging:

### Performance-Relevant Features
- **Timeline (Gantt chart)**: Visualizes action duration; identifies slow actions
- **Network tab**: Chronological HTTP requests with method, URL, status, response time, payload size
- **DOM snapshots**: Inspect render state at each step
- **Action duration tracking**: Spot actions taking longer than expected

### Usage for Performance
```typescript
// Record trace for performance analysis
await browser.startTracing(page, {
  path: './traces/performance-trace.json'
});
// ... user flow ...
await browser.stopTracing();
```

### Chrome Trace Analysis Pattern
Chrome trace files contain `traceEvents` with:
- CPU profiler data (`disabled-by-default-v8.cpu_profiler`)
- Per-function execution duration via `samples` + `timeDeltas`
- Call stack hierarchy for bottleneck identification

**Assessment:** Trace Viewer is useful for ad-hoc performance investigation but NOT a substitute for structured performance testing with assertions.

## Key Finding 5: Performance Testing Pipeline Patterns

### Recommended CI Structure
Community consensus recommends **separate performance pipelines**:

1. **Smoke performance tests** on every PR (lightweight, < 30s):
   - TTFB assertions
   - FCP/LCP assertions on critical pages
   - Bundle size checks

2. **Full performance suite** on schedule (nightly/weekly):
   - Lighthouse audits across all pages
   - Load testing with Artillery
   - Network-throttled user flows
   - Performance trend tracking

### Playwright Config for Dedicated Performance Project
```typescript
export default defineConfig({
  projects: [
    {
      name: 'functional',
      testDir: './tests/e2e',
    },
    {
      name: 'performance',
      testDir: './tests/performance',
      use: { headless: true },
      timeout: 60000,  // Longer timeout for perf tests
    },
  ],
});
```

## Observations

1. **Artillery is the clear winner** for Playwright-based load testing — built-in engine, auto Web Vitals, distributed scaling
2. **k6 browser is compelling for Grafana-stack teams** but requires script adaptation
3. **Network throttling requires CDP** — no built-in Playwright API exists; feature requests remain open
4. **Trace Viewer is for investigation, not automation** — useful for debugging performance issues found by automated tests
5. **Separate performance pipeline is the consensus** — performance tests are structurally different from functional tests (longer timeouts, different assertions, different run frequency)
