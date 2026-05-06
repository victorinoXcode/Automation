import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

async function assertEACannotCreateZPO(
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

    const zpoRoleRadio = page.locator('input[value="Zoe Platform Operations"]');
    await expect(zpoRoleRadio).not.toBeVisible();
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("EA Cannot Create ZPO", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("EA cannot see Zoe Platform Operations role option", async ({browser}) => {
    qase.id(2219);
    await assertEACannotCreateZPO(browser);
  });
});
