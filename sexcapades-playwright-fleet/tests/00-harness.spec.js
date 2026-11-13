const { test, expect } = require("./fixtures");

test("S0-01 mandatory test harness reports ALL TESTS PASSED", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  // utm_source=fleet tags this load so analytics excludes fleet traffic.
  await page.goto("/qa/test-runner.html?utm_source=fleet");
  await expect(page.locator("#suiteBadge")).toContainText("ALL TESTS PASSED", { timeout: 30_000 });

  const telemetryText = await page.locator("#rawTelemetry").textContent();
  const telemetry = JSON.parse(telemetryText || "{}");
  expect(telemetry.status).toBe("PASSED");
  expect((telemetry.tests || []).filter(t => !t.passed), "failed unit tests").toEqual([]);
  expect(pageErrors, "uncaught page errors during baseline").toEqual([]);
});
