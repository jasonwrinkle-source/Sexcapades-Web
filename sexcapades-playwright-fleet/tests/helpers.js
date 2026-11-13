const { expect } = require("@playwright/test");

async function openApp(page, route = "#app/map") {
  const hash = route.startsWith("#") ? route : `#${route}`;
  // The live host bounces a fresh context to the age gate. ?verified=1 is the
  // gate's own return marker and lets the app stay on the requested route.
  // utm_source=fleet tags this load so analytics excludes fleet traffic.
  await page.goto(`/qa/app.html?verified=1&utm_source=fleet${hash}`);
  await page.waitForLoadState("domcontentloaded");
  const enter = page.getByRole("button", { name: /I am 18 or older/i });
  if (await enter.isVisible().catch(() => false)) {
    await enter.click();
    await page.waitForURL(/\/qa\/app\.html/, { timeout: 8000 });
  }
  const boot = page.locator("#sxBootDialog");
  // A healthy boot leaves this screen well inside 30s. A hang stays on it
  // past 90s, so failing here names the stage instead of dying later inside
  // page.evaluate when the main thread never goes idle.
  try {
    await boot.waitFor({ state: "hidden", timeout: 30_000 });
  } catch (err) {
    const status = await page.evaluate(() => {
      const label = document.getElementById("sxBootLabel");
      const pct = document.getElementById("sxBootPct");
      return {
        label: label ? (label.textContent || "").trim() : "",
        pct: pct ? (pct.textContent || "").trim() : ""
      };
    }).catch(() => ({ label: "", pct: "" }));
    throw new Error("Boot screen still up at " + (status.pct || "?") + " - " + (status.label || "no stage text"));
  }
}

async function readRuntimeErrors(page) {
  return page.evaluate(() => ({
    queue: Array.isArray(window.__sxErrLogQueue) ? window.__sxErrLogQueue : null,
    logger: window.__sxErrLog && Array.isArray(window.__sxErrLog.errors)
      ? window.__sxErrLog.errors : null
  }));
}

async function assertNoInvalidSvgGeometry(page) {
  const invalid = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll("svg path").forEach(node => {
      const d = node.getAttribute("d") || "";
      if (/NaN|Infinity/.test(d) && bad.length < 5) bad.push(d.slice(0, 160));
    });
    return bad;
  });
  expect(invalid, "SVG paths must have valid path data").toEqual([]);
}

module.exports = { openApp, readRuntimeErrors, assertNoInvalidSvgGeometry };
