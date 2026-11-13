const { test, expect } = require("@playwright/test");
const { openApp } = require("./helpers");

test("S3-01 pairwise compatibility engine returns a positive play headline", async ({ page }) => {
  await openApp(page);
  const result = await page.evaluate(() => {
    const engine = window.__SEXCAPADES_SYNC_ENGINE;
    if (!engine || typeof engine.pair !== "function") return { unsupported: true };
    const a = {
      name: "Dominant Alice",
      ratings: { t0022: { give: 100, receive: -50 }, t0056: { give: 80, receive: 0 } },
      annotations: { t0022: "favorite" }
    };
    const b = {
      name: "Submissive Bob",
      ratings: { t0022: { give: -50, receive: 90 }, t0056: { give: 0, receive: 70 } },
      annotations: {}
    };
    const pair = engine.pair(a, b);
    return { hasPlay: !!(pair && pair.play), headline: pair && pair.play && pair.play.headline };
  });
  test.skip(result.unsupported, "Compatibility engine hook is not exposed");
  expect(result.hasPlay).toBeTruthy();
  expect(result.headline).toBeGreaterThan(0);
});
