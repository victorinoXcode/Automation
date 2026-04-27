import {expect, test} from "@playwright/test";

import {env} from "@/commons/env";
import {FaafFormsPage} from "@/pages/core/portal/FaafFormsPage";

test.describe("Advisor match form [CS]", () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      indexedDB.deleteDatabase("localforage");
    });
  });

  test("Should be able to fill Advisor Match Form", async ({page}) => {
    const baseUrl = env.BASE_URL_PORTAL;
    if (!baseUrl) throw new Error("BASE_URL_PORTAL must be set in .env");
    await page.goto(`${baseUrl}/advisor-match`);
    await page.getByText(/how old are you\?/i).waitFor({state: "visible"});
    const faaf = new FaafFormsPage(page);
    await faaf.advisorMatch();
    const sidebarMatchItems = faaf.leftMenuItemsBelowAdvisorMatches;
    await expect(sidebarMatchItems.first()).toBeVisible({timeout: 15_000});
    const count = await sidebarMatchItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
