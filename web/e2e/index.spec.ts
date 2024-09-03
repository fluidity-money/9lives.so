import { test, expect } from "./fixtures";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("The main page loads within 5 seconds of entering the site", async ({
    page,
  }) => {
    await page.waitForLoadState("load", { timeout: 5000 });
    await expect(page.getByTestId("header-logo")).toBeInViewport();
  });

});
