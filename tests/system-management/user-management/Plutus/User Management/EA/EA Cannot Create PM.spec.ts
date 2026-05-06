import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

async function assertEACannotCreatePM(
  browser: import("@playwright/test").Browser,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE.ea,
  });
  const page = await context.newPage();

  try {
    const dashboardBase = requireDashboardBaseUrl();
    const usersPage = new UsersManagementPage(page, dashboardBase);
    const addUserPage = new AddUserPage(page);

    await usersPage.goto();
    await usersPage.openAddNewUser();
    await addUserPage.waitUntilLoaded();

    const pmRoleRadio = page.locator('input[value="Portfolio Manager"]');
    await expect(pmRoleRadio).not.toBeVisible();
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("EA Cannot Create PM", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("EA cannot see Portfolio Manager role option", async ({browser}) => {
    qase.id(2218);
    await assertEACannotCreatePM(browser);
  });
});
