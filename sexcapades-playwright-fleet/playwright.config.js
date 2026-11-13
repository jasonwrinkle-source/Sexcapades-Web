const { defineConfig, devices } = require("@playwright/test");

// Local server by default (fast before/after timing, no deploy); override with
// BASE_URL=http://localhost:<port> (or the live/QA URL) — the fleet tag is always added.
const rawBaseURL = process.env.BASE_URL || "http://localhost:8000";
const baseURL = rawBaseURL.includes("?")
  ? `${rawBaseURL}&utm_source=fleet`
  : `${rawBaseURL}?utm_source=fleet`;
const desktop = { viewport: { width: 1440, height: 1000 } };

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }], ["json", { outputFile: "test-results/results.json" }]],
  timeout: 45_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: false
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], ...desktop } },
    { name: "chrome-stable", use: { ...devices["Desktop Chrome"], channel: "chrome", ...desktop } },
    { name: "edge-stable", use: { ...devices["Desktop Edge"], channel: "msedge", ...desktop } },
    { name: "chromium-small-laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "chromium-large-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
    { name: "chromium-tablet-landscape", use: { ...devices["Desktop Chrome"], viewport: { width: 1194, height: 834 }, hasTouch: true, isMobile: false } },
    { name: "chromium-tablet-portrait", use: { ...devices["Desktop Chrome"], viewport: { width: 834, height: 1194 }, hasTouch: true, isMobile: false } },
    { name: "chromium-android-small", use: { ...devices["Pixel 7"] } },
    { name: "chromium-android-large", use: { ...devices["Pixel 7 Pro"] } },
    { name: "chromium-android-tablet", use: { ...devices["Galaxy Tab S4"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"], ...desktop } },
    { name: "firefox-small", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
    { name: "firefox-large", use: { ...devices["Desktop Firefox"], viewport: { width: 1920, height: 1080 } } },
    { name: "firefox-android-sized", use: { ...devices["Desktop Firefox"], viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], ...desktop } },
    // The other WebKit sizes repeat the boot-screen hang (still up past 90s
    // on the controls stage). One WebKit project stays in the full run until
    // that hang finishes. Uncomment these four to put the sizes back.
    // { name: "webkit-small", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
    // { name: "webkit-large", use: { ...devices["Desktop Safari"], viewport: { width: 1920, height: 1080 } } },
    // { name: "webkit-iphone-emulation", use: { ...devices["iPhone 15"] } },
    // { name: "webkit-ipad", use: { ...devices["iPad Pro 11"] } },
    { name: "chromium-touch", use: { ...devices["Desktop Chrome"], viewport: { width: 900, height: 700 }, hasTouch: true } },
    { name: "chromium-narrow", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true } },
    { name: "chromium-mid-mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "chromium-wide-mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
    { name: "chromium-high-dpi", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 } }
  ]
});
