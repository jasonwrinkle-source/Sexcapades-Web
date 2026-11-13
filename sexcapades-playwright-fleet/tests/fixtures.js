// Shared Playwright fixtures for the Sexcapades fleet.
//
// consoleCapture (auto): collects browser console errors/warnings and page
// errors on every page, and attaches them to the test result when the test
// fails, so a failure comes with the app's own console output attached — no
// separate reproduction run is needed to see what the app logged (e.g. the
// "Map paused safely." exception behind an S2-01 failure). Passing tests
// attach nothing, so they stay lean. The attachment lands in the HTML
// report and in test-results/<test>/ as console-errors.txt.
//
// Usage: spec files require { test, expect } from "./fixtures" instead of
// "@playwright/test". The auto fixture runs for every test without the test
// requesting it. It coexists with per-test page.on listeners (00-harness,
// 90-cross-browser-health) — multiple listeners on one page are fine.
const { test: baseTest, expect } = require("@playwright/test");

const test = baseTest.extend({
  consoleCapture: [async ({ page }, use, testInfo) => {
    const lines = [];
    const onConsole = (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        lines.push(`[console:${type}] ${msg.text()}`);
      }
    };
    const onPageError = (err) => {
      lines.push(`[pageerror] ${err && err.message ? err.message : String(err)}`);
      if (err && err.stack) lines.push(String(err.stack));
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    await use();
    // Teardown: attach only on failure.
    if (testInfo.status !== "passed") {
      const body = lines.length
        ? lines.join("\n")
        : "(no console errors or page errors captured)";
      await testInfo.attach("console-errors.txt", {
        body,
        contentType: "text/plain",
      });
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }, { auto: true }],
});

module.exports = { test, expect };
