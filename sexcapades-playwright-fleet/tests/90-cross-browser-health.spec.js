const { test, expect } = require("@playwright/test");
const { openApp, readRuntimeErrors } = require("./helpers");

test("S9-01 app route produces no uncaught errors or internal exception queue entries", async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  page.on("pageerror", e => pageErrors.push(e.message));
  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
    if (msg.type() === "warning") consoleWarnings.push(msg.text());
  });

  await openApp(page, "#app/map");
  const internal = await readRuntimeErrors(page);

  expect(pageErrors, "uncaught page errors").toEqual([]);
  expect(internal.queue || [], "internal caught-error queue").toEqual([]);
  expect(internal.logger || [], "internal error logger").toEqual([]);

  // Warnings and console errors are attached to test output for triage;
  // not all third-party/browser warnings are application defects.
  test.info().attach("console-diagnostics.json", {
    body: JSON.stringify({ consoleErrors, consoleWarnings }, null, 2),
    contentType: "application/json"
  });
});
