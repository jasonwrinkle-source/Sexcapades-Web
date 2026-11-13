# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 20-hypermap.spec.js >> Squad 2 — hypermap geometry and interaction >> S2-01 viewport has a non-collapsed bounding box
- Location: tests\20-hypermap.spec.js:5:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8000/qa/app.html?verified=1#app/map
Call log:
  - navigating to "http://localhost:8000/qa/app.html?verified=1#app/map", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e6]:
      - heading "Hmmm… can't reach this page" [level=1] [ref=e7]
      - paragraph [ref=e8]:
        - strong [ref=e9]: localhost
        - text: refused to connect.
      - generic [ref=e10]:
        - paragraph [ref=e11]: "Try:"
        - list [ref=e12]:
          - listitem [ref=e13]: •Checking the connection
          - listitem [ref=e14]:
            - text: •
            - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
              - /url: "#buttons"
      - generic [ref=e16]: ERR_CONNECTION_REFUSED
    - button "Refresh" [ref=e19] [cursor=pointer]
  - generic [ref=e20]: Microsoft Edge
```

# Test source

```ts
  1  | const { expect } = require("@playwright/test");
  2  | 
  3  | async function openApp(page, route = "#app/map") {
  4  |   const hash = route.startsWith("#") ? route : `#${route}`;
  5  |   // The live host bounces a fresh context to the age gate. ?verified=1 is the
  6  |   // gate's own return marker and lets the app stay on the requested route.
> 7  |   await page.goto(`/qa/app.html?verified=1${hash}`);
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8000/qa/app.html?verified=1#app/map
  8  |   await page.waitForLoadState("domcontentloaded");
  9  |   const enter = page.getByRole("button", { name: /I am 18 or older/i });
  10 |   if (await enter.isVisible().catch(() => false)) {
  11 |     await enter.click();
  12 |     await page.waitForURL(/\/qa\/app\.html/, { timeout: 8000 });
  13 |   }
  14 |   const boot = page.locator("#sxBootDialog");
  15 |   // A healthy boot leaves this screen well inside 30s. A hang stays on it
  16 |   // past 90s, so failing here names the stage instead of dying later inside
  17 |   // page.evaluate when the main thread never goes idle.
  18 |   try {
  19 |     await boot.waitFor({ state: "hidden", timeout: 30_000 });
  20 |   } catch (err) {
  21 |     const status = await page.evaluate(() => {
  22 |       const label = document.getElementById("sxBootLabel");
  23 |       const pct = document.getElementById("sxBootPct");
  24 |       return {
  25 |         label: label ? (label.textContent || "").trim() : "",
  26 |         pct: pct ? (pct.textContent || "").trim() : ""
  27 |       };
  28 |     }).catch(() => ({ label: "", pct: "" }));
  29 |     throw new Error("Boot screen still up at " + (status.pct || "?") + " - " + (status.label || "no stage text"));
  30 |   }
  31 | }
  32 | 
  33 | async function readRuntimeErrors(page) {
  34 |   return page.evaluate(() => ({
  35 |     queue: Array.isArray(window.__sxErrLogQueue) ? window.__sxErrLogQueue : null,
  36 |     logger: window.__sxErrLog && Array.isArray(window.__sxErrLog.errors)
  37 |       ? window.__sxErrLog.errors : null
  38 |   }));
  39 | }
  40 | 
  41 | async function assertNoInvalidSvgGeometry(page) {
  42 |   const invalid = await page.evaluate(() => {
  43 |     const bad = [];
  44 |     document.querySelectorAll("svg path").forEach(node => {
  45 |       const d = node.getAttribute("d") || "";
  46 |       if (/NaN|Infinity/.test(d) && bad.length < 5) bad.push(d.slice(0, 160));
  47 |     });
  48 |     return bad;
  49 |   });
  50 |   expect(invalid, "SVG paths must have valid path data").toEqual([]);
  51 | }
  52 | 
  53 | module.exports = { openApp, readRuntimeErrors, assertNoInvalidSvgGeometry };
  54 | 
```