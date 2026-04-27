import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE, type AuthRole} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {
  getFormattedDateMMDDYYYY,
  getRandomLetter,
  getRandomNumber,
} from "@/utils/math";

const TARGET_USER_SEARCH = "zoe.qautomation+advisor@gmail.com";

function createRandomBasicInfo(role: AuthRole) {
  const rolePrefix = role.toUpperCase();
  const dateSuffix = getFormattedDateMMDDYYYY().slice(-4);
  const firstNameLetter = getRandomLetter() ?? "x";
  const lastNameLetter = getRandomLetter() ?? "x";
  const firstName = `${rolePrefix}${firstNameLetter.toUpperCase()}${getRandomNumber(999)}`;
  const lastName = `QA${dateSuffix}${lastNameLetter.toUpperCase()}`;

  return {firstName, lastName};
}

async function assertCanChangeBasicInfo(
  browser: import("@playwright/test").Browser,
  role: AuthRole,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE[role],
  });
  const page = await context.newPage();

  try {
    const basicInfo = createRandomBasicInfo(role);
    const dashboardBase = requireDashboardBaseUrl();
    const usersPage = new UsersManagementPage(page, dashboardBase);
    const basicInfoPage = new BasicInfoPage(page);

    await page.goto(dashboardBase);
    await expect(page).toHaveURL(new RegExp(`${dashboardBase}/dashboard`));

    await usersPage.goto();
    await usersPage.openUserBySearch(TARGET_USER_SEARCH);

    await basicInfoPage.waitUntilLoaded();
    await basicInfoPage.updateBasicInfo(basicInfo);
    await expect(basicInfoPage.saveChangesButton).toBeEnabled();

    await basicInfoPage.saveChanges();

    await expect(basicInfoPage.firstNameInput).toHaveValue(basicInfo.firstName);
    await expect(basicInfoPage.lastNameInput).toHaveValue(basicInfo.lastName);
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("ZPO/PM Change Basic Info", () => {
  test.describe.configure({mode: "serial"});

  test("PM can change basic info for created user", async ({browser}) => {
    qase.id(2094);
    await assertCanChangeBasicInfo(browser, "pm");
  });

  test("ZPO can change basic info for created user", async ({browser}) => {
    qase.id(1626);
    await assertCanChangeBasicInfo(browser, "zpo");
  });
});
