import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {env} from "@/commons/env";
import {FaafFormsPage} from "@/pages/core/portal/FaafFormsPage";

test.describe("Find an advisor form [CS]", () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      indexedDB.deleteDatabase("localforage");
    });
  });

  test("Should be able to fill Find-an-advisor on boarding form", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    qase.id(1237);
    const baseUrl = env.BASE_URL_PORTAL;
    if (!baseUrl) throw new Error("BASE_URL_PORTAL must be set in .env");
    await page.goto(`${baseUrl}/find-an-advisor`);
    await page.waitForTimeout(4000);
    const faaf = new FaafFormsPage(page);
    await faaf.findAnAdvisorForm();
    const sidebarMatchItems = faaf.leftMenuItemsBelowAdvisorMatches;
    await expect(sidebarMatchItems.first()).toBeVisible({timeout: 15_000});
    const count = await sidebarMatchItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
