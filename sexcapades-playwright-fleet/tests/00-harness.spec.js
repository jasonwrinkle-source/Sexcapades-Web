const { test, expect } = require("@playwright/test");

test("S0-01 mandatory test harness reports ALL TESTS PASSED", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto("/qa/test-runner.html");
  await expect(page.locator("#suiteBadge")).toContainText("ALL TESTS PASSED", { timeout: 30_000 });

  const telemetryText = await page.locator("#rawTelemetry").textContent();
  const telemetry = JSON.parse(telemetryText || "{}");
  expect(telemetry.status).toBe("PASSED");
  expect((telemetry.tests || []).filter(t => !t.passed), "failed unit tests").toEqual([]);
  expect(pageErrors, "uncaught page errors during baseline").toEqual([]);
});
