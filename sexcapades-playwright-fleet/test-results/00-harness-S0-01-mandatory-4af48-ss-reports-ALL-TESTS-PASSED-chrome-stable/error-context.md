# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 00-harness.spec.js >> S0-01 mandatory test harness reports ALL TESTS PASSED
- Location: tests\00-harness.spec.js:3:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#suiteBadge')
Expected substring: "ALL TESTS PASSED"
Received string:    "8 FAILED"
Timeout: 30000ms

Call log:
  - Expect "toContainText" locator('#suiteBadge') with timeout 30000ms
  - waiting for locator('#suiteBadge')
    15 × locator resolved to <span id="suiteBadge" class="badge running">RUNNING</span>
       - unexpected value "RUNNING"
    44 × locator resolved to <span id="suiteBadge" class="badge failed">8 FAILED</span>
       - unexpected value "8 FAILED"

```

```yaml
- text: 8 FAILED
```

# Test source

```ts
  1  | const { test, expect } = require("@playwright/test");
  2  | 
  3  | test("S0-01 mandatory test harness reports ALL TESTS PASSED", async ({ page }) => {
  4  |   const pageErrors = [];
  5  |   page.on("pageerror", error => pageErrors.push(error.message));
  6  |   await page.goto("/qa/test-runner.html");
> 7  |   await expect(page.locator("#suiteBadge")).toContainText("ALL TESTS PASSED", { timeout: 30_000 });
     |                                             ^ Error: expect(locator).toContainText(expected) failed
  8  | 
  9  |   const telemetryText = await page.locator("#rawTelemetry").textContent();
  10 |   const telemetry = JSON.parse(telemetryText || "{}");
  11 |   expect(telemetry.status).toBe("PASSED");
  12 |   expect((telemetry.tests || []).filter(t => !t.passed), "failed unit tests").toEqual([]);
  13 |   expect(pageErrors, "uncaught page errors during baseline").toEqual([]);
  14 | });
  15 | 
```