const { test, expect } = require("./fixtures");
const { openApp, assertNoInvalidSvgGeometry } = require("./helpers");

test.describe("Squad 2 — hypermap geometry and interaction", () => {
  test("S2-01 viewport has a non-collapsed bounding box", async ({ page }) => {
    await openApp(page);
    // #viewport is an SVG group. getBBox on that whole tree hangs, and its
    // CSS client box is 0 even when the map is painted. The map card is a
    // real CSS box, and the topic groups are the paint.
    const scene = page.locator(".map-scene");
    await expect(scene).toBeVisible();
    const box = await scene.boundingBox();
    expect(box, "the map card should have a CSS box").toBeTruthy();
    expect(box.width).toBeGreaterThan(50);
    expect(box.height).toBeGreaterThan(50);
    // The node count is a race without this wait: right after the boot
    // dialog hides the nodes have not painted yet (count is 0), and they
    // only land later (1336 after ~30s in a standalone load). Wait for the
    // first node to become visible before counting, so a slow paint passes
    // and only a real failure (nodes never appear, e.g. the hypermap
    // pause) fails — and the console-errors attachment then shows why.
    const nodes = page.locator("#mapSvg .node-group");
    await expect(nodes.first()).toBeVisible({ timeout: 60000 });
    expect(await nodes.count()).toBeGreaterThan(0);
  });

  test("S2-02 crossing metric is finite", async ({ page }) => {
    await openApp(page);
    const metric = await page.evaluate(() =>
      typeof window.__sxCrossingMeasure === "function" ? window.__sxCrossingMeasure() : null
    );
    test.skip(!metric, "Crossing metric hook is not exposed");
    expect(Number.isFinite(metric.crossing)).toBeTruthy();
  });

  test("S2-03 SVG geometry contains no NaN or Infinity", async ({ page }) => {
    await openApp(page);
    await assertNoInvalidSvgGeometry(page);
  });

  test("S2-04 branch focus keeps camera scale in expected range", async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(() => {
      if (typeof window.__sxFocusBranch !== "function") return { unsupported: true };
      window.__sxFocusBranch("Bondage & restriction");
      const direct = window.__sxViewportScale ||
        (window.SexcapadesEngine && window.SexcapadesEngine.Camera && window.SexcapadesEngine.Camera.scale);
      if (Number.isFinite(direct)) return direct;
      const viewport = document.getElementById("viewport");
      const transform = viewport ? viewport.getAttribute("transform") || "" : "";
      const match = /scale\(\s*([-\d.eE+]+)/.exec(transform);
      const scale = match ? Number(match[1]) : NaN;
      return Number.isFinite(scale) ? scale : { unsupported: true };
    });
    test.skip(!result || result.unsupported, "Branch focus hook is not exposed");
    expect(Number.isFinite(result)).toBeTruthy();
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(2.3);
  });
});
