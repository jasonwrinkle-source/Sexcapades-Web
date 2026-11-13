# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 20-hypermap.spec.js >> Squad 2 — hypermap geometry and interaction >> S2-01 viewport has a non-collapsed bounding box
- Location: tests\20-hypermap.spec.js:5:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | const { openApp, assertNoInvalidSvgGeometry } = require("./helpers");
  3  | 
  4  | test.describe("Squad 2 — hypermap geometry and interaction", () => {
  5  |   test("S2-01 viewport has a non-collapsed bounding box", async ({ page }) => {
  6  |     await openApp(page);
  7  |     // #viewport is an SVG group. getBBox on that whole tree hangs, and its
  8  |     // CSS client box is 0 even when the map is painted. The map card is a
  9  |     // real CSS box, and the topic groups are the paint.
  10 |     const scene = page.locator(".map-scene");
  11 |     await expect(scene).toBeVisible();
  12 |     const box = await scene.boundingBox();
  13 |     expect(box, "the map card should have a CSS box").toBeTruthy();
  14 |     expect(box.width).toBeGreaterThan(50);
  15 |     expect(box.height).toBeGreaterThan(50);
> 16 |     expect(await page.locator("#mapSvg .node-group").count()).toBeGreaterThan(0);
     |                                                               ^ Error: expect(received).toBeGreaterThan(expected)
  17 |   });
  18 | 
  19 |   test("S2-02 crossing metric is finite", async ({ page }) => {
  20 |     await openApp(page);
  21 |     const metric = await page.evaluate(() =>
  22 |       typeof window.__sxCrossingMeasure === "function" ? window.__sxCrossingMeasure() : null
  23 |     );
  24 |     test.skip(!metric, "Crossing metric hook is not exposed");
  25 |     expect(Number.isFinite(metric.crossing)).toBeTruthy();
  26 |   });
  27 | 
  28 |   test("S2-03 SVG geometry contains no NaN or Infinity", async ({ page }) => {
  29 |     await openApp(page);
  30 |     await assertNoInvalidSvgGeometry(page);
  31 |   });
  32 | 
  33 |   test("S2-04 branch focus keeps camera scale in expected range", async ({ page }) => {
  34 |     await openApp(page);
  35 |     const result = await page.evaluate(() => {
  36 |       if (typeof window.__sxFocusBranch !== "function") return { unsupported: true };
  37 |       window.__sxFocusBranch("Bondage & restriction");
  38 |       const direct = window.__sxViewportScale ||
  39 |         (window.SexcapadesEngine && window.SexcapadesEngine.Camera && window.SexcapadesEngine.Camera.scale);
  40 |       if (Number.isFinite(direct)) return direct;
  41 |       const viewport = document.getElementById("viewport");
  42 |       const transform = viewport ? viewport.getAttribute("transform") || "" : "";
  43 |       const match = /scale\(\s*([-\d.eE+]+)/.exec(transform);
  44 |       const scale = match ? Number(match[1]) : NaN;
  45 |       return Number.isFinite(scale) ? scale : { unsupported: true };
  46 |     });
  47 |     test.skip(!result || result.unsupported, "Branch focus hook is not exposed");
  48 |     expect(Number.isFinite(result)).toBeTruthy();
  49 |     expect(result).toBeGreaterThan(0);
  50 |     expect(result).toBeLessThanOrEqual(2.3);
  51 |   });
  52 | });
  53 | 
```