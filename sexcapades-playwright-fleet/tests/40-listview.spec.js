const { test, expect } = require("./fixtures");
const { openApp } = require("./helpers");

test("S4-01 listview route loads and renders content", async ({ page }) => {
  await openApp(page, "#app/listview");
  await expect(page).toHaveURL(/#app\/listview/);
  await expect(page.locator("body")).not.toContainText("NaN");
  await expect(page.locator("body")).not.toContainText("Infinity");
  const dialog = page.getByRole("dialog", { name: "Popularity List" });
  await expect(dialog).toBeVisible();
  // body.innerText is empty on some headless captures even after the dialog
  // is in the accessibility tree. Read the dialog text in the page.
  const visibleText = (await dialog.evaluate(el => el.innerText || el.textContent || "")).trim();
  expect(visibleText.length).toBeGreaterThan(50);
});
