# Sexcapades Playwright Browser Fleet

This is an initial executable test harness based on `AI_FLEET_TESTING_BRIEFING.md`.
It defines **24 Playwright projects/configurations**. Projects are run independently and can be sharded or parallelized by CI.

## What the matrix means

- Chromium desktop plus Chrome and Edge stable channels.
- Firefox desktop at multiple viewport sizes.
- WebKit desktop plus iPhone/iPad emulation.
- Chromium Android device emulation, touch, tablet, narrow/mobile, and high-DPI profiles.

**Important:** Playwright WebKit is not identical to shipping Safari. iOS Safari and real Android/desktop browser coverage require real-device or cloud-browser infrastructure (for example BrowserStack). Emulation does not prove behavior on physical devices.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npx playwright install --with-deps
npm test
```

Run the mandatory baseline first:

```bash
npm run test:smoke
```

Set a different deployment:

```bash
BASE_URL=https://sexcapades.io npm test
```

On Windows PowerShell:

```powershell
$env:BASE_URL="https://sexcapades.io"
npm test
```

## Outputs

- `playwright-report/` — interactive HTML report.
- `test-results/results.json` — machine-readable result data.
- Playwright traces, screenshots, and videos for failed tests.

## Test coverage currently implemented

| Area | Included checks |
|---|---|
| Harness | `#suiteBadge`, `#rawTelemetry`, JSON telemetry, failed unit list |
| Profile I/O | JSON import; KinkTest and BDSMtest parser hooks |
| Hypermap | viewport bounding box; crossing metric; SVG path validity; camera scale |
| Compatibility | pairwise sync headline |
| Listview | route loads; basic rendered-content sanity |
| Runtime health | uncaught page errors; internal caught-error queues; console diagnostics |

## Known gaps / deliberate safeguards

The briefing does not provide stable selectors for all controls (profile tabs, search field, rating pills, topic sheet, export menu, veil slider), nor exact expected data for every UI flow. Those tests are not fabricated here. Add stable `data-testid` attributes to the app, then implement those journeys against the actual DOM.

The profile and engine tests use the public hooks named in the briefing. If a hook is absent in a deployment, Playwright marks that check as skipped rather than falsely reporting a pass. Confirm the hook names against the current build before treating the report as a release gate.

The JSON import test mutates browser-local profile state. Use an isolated test deployment or disposable browser context. Do not run destructive profile/import/export tests against real user profiles.

## Suggested CI strategy

1. Run `00-harness.spec.js` as a mandatory gate on Chromium.
2. Run the full suite across all 24 projects on pull requests or nightly.
3. Add BrowserStack real-device runs for iOS Safari and Android Chrome.
4. Upload HTML report, JSON results, traces, screenshots, and videos as CI artifacts.
5. Keep the same app build and test fixtures across browser projects to make comparisons meaningful.

## Important interpretation

This package is a test-suite scaffold, not evidence that the website has passed. No browser tests have been executed as part of creating these files. The first real run requires installing dependencies/browser binaries and running against the target build.
