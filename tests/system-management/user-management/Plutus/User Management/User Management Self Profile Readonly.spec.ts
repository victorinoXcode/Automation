import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE, type AuthRole} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {PersonalInformationPage} from "@/pages/settings/personal-information/PersonalInformationPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {getRoleCredentials} from "@/utils/auth";

async function assertSelfUserIsReadonly(
  browser: import("@playwright/test").Browser,
  role: AuthRole,
) {
  const credentials = getRoleCredentials(role);
  if (!credentials.email) {
    throw new Error(`Missing email for role "${role}"`);
  }

  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE[role],
  });
  const page = await context.newPage();
  const usersManagementPage = new UsersManagementPage(
    page,
    requireDashboardBaseUrl(),
  );
  const personalInformationPage = new PersonalInformationPage(page);

  try {
    await usersManagementPage.goto();
    await usersManagementPage.openUserBySearch(credentials.email);
    await personalInformationPage.waitUntilLoaded();

    await expect(personalInformationPage.readonlyMessage).toBeVisible();
    await expect(personalInformationPage.saveChangesButton).toBeDisabled();
    await expect(personalInformationPage.firstNameInput).toBeDisabled();
    await expect(personalInformationPage.lastNameInput).toBeDisabled();
    await expect(personalInformationPage.emailInput).toBeDisabled();
    await expect(personalInformationPage.phoneNumberInput).toBeDisabled();
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("User Management Self Profile Readonly", () => {
  test("PM cannot edit their own profile from User Management", async ({
    browser,
  }) => {
    qase.id(979);
    await assertSelfUserIsReadonly(browser, "pm");
  });

  test("ZPO cannot edit their own profile from User Management", async ({
    browser,
  }) => {
    qase.id(2118);
    await assertSelfUserIsReadonly(browser, "zpo");
  });
});
