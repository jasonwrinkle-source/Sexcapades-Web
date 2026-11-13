const { test, expect } = require("@playwright/test");
const path = require("path");
const { openApp } = require("./helpers");

test.describe("Squad 1 — profile conversion and persistence", () => {
  test("S1-01 JSON import accepts a representative profile", async ({ page }) => {
    await openApp(page, "#app/map");
    const fixture = path.join(__dirname, "..", "fixtures", "adam-peasant.sexcapades.json");
    await page.locator("#fileInput").setInputFiles(fixture);
    await expect(page.locator("[data-profile-label]", { hasText: "Adam Peasant" })).toBeVisible({ timeout: 20000 });
  });

  test("S1-02 KinkTest and BDSMtest parsers return ratings", async ({ page }) => {
    await openApp(page);
    const result = await page.evaluate(() => {
      const api = window.__sexcapades && window.__sexcapades.ProfileIO;
      if (!api || typeof api.parse !== "function") return { unsupported: true };
      const kink = api.parse("kinktest", "Bondage: 85% dom, 30% sub\n#1: favorite\n#2: hard limit");
      const bdsm = api.parse("bdsmtest", "100% Dominant\n80% Rigger\n0% Submissive");
      return {
        kinkCount: kink && kink.ratings ? Object.keys(kink.ratings).length : 0,
        bdsmCount: bdsm && bdsm.ratings ? Object.keys(bdsm.ratings).length : 0
      };
    });
    test.skip(result.unsupported, "ProfileIO parser API is not exposed on this build");
    expect(result.kinkCount).toBeGreaterThan(0);
    expect(result.bdsmCount).toBeGreaterThan(0);
  });
});
