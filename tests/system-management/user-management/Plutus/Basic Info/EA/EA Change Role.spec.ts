import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE, type AuthRole} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

const TARGET_USER_SEARCH = "zoe.qautomation+advisor@gmail.com";

function buildAlternativeLastName(currentLastName: string) {
  const normalizedLastName = currentLastName.trim() || "User";
  return `${normalizedLastName} QA`;
}

function isAdvisorRole(roleName: string) {
  return roleName.startsWith("Advisor");
}

async function openFirstEditableAdvisorUser(
  page: import("@playwright/test").Page,
  usersPage: UsersManagementPage,
  basicInfoPage: BasicInfoPage,
) {
  await usersPage.goto();
  await usersPage.openUserBySearch(TARGET_USER_SEARCH);
  await basicInfoPage.waitUntilLoaded();

  if (await basicInfoPage.isAccessRemoved()) {
    await basicInfoPage.restoreAccess();
  }

  const initialFieldErrors = await basicInfoPage.getFieldErrors();
  if (initialFieldErrors.length > 0) {
    throw new Error(
      `The target advisor user already has validation errors: ${initialFieldErrors.join(" | ")}`,
    );
  }

  const initialRole = await basicInfoPage.getSelectedRole();
  if (!isAdvisorRole(initialRole)) {
    throw new Error(
      `The target user role is "${initialRole}" instead of an Advisor role`,
    );
  }

  const targetRole =
    await basicInfoPage.getFirstAvailableAlternativeRole(initialRole);
  const initialLastName = await basicInfoPage.getLastNameValue();
  const updatedLastName = buildAlternativeLastName(initialLastName);

  await basicInfoPage.selectRole(targetRole);
  await expect(basicInfoPage.getRoleRadio(targetRole)).toBeChecked({
    timeout: 5_000,
  });

  await basicInfoPage.updateLastName(updatedLastName);

  const fieldErrors = await basicInfoPage.getFieldErrors();
  if (fieldErrors.length > 0) {
    throw new Error(
      `The target advisor user became invalid before save: ${fieldErrors.join(" | ")}`,
    );
  }

  await expect(basicInfoPage.saveChangesButton).toBeEnabled();
  await basicInfoPage.saveChanges();
  await expect(basicInfoPage.getRoleRadio(targetRole)).toBeChecked();
  await expect(basicInfoPage.lastNameInput).toHaveValue(updatedLastName);
  await basicInfoPage.dismissSaveSuccessDialog();

  await page.reload({waitUntil: "domcontentloaded"});
  await basicInfoPage.waitUntilLoaded();
  await expect(basicInfoPage.getRoleRadio(targetRole)).toBeChecked();
  await expect(basicInfoPage.lastNameInput).toHaveValue(updatedLastName);

  return {initialRole, targetRole, initialLastName, updatedLastName};
}

async function assertCanChangeRole(
  browser: import("@playwright/test").Browser,
  authRole: AuthRole,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE[authRole],
  });
  const page = await context.newPage();
  const usersPage = new UsersManagementPage(page, requireDashboardBaseUrl());
  const basicInfoPage = new BasicInfoPage(page);

  try {
    const {initialRole, initialLastName} =
      await openFirstEditableAdvisorUser(
      page,
      usersPage,
      basicInfoPage,
    );

    await basicInfoPage.selectRole(initialRole);
    await basicInfoPage.updateLastName(initialLastName);
    await expect(basicInfoPage.saveChangesButton).toBeEnabled();
    await basicInfoPage.saveChanges();
    await expect(basicInfoPage.getRoleRadio(initialRole)).toBeChecked();
    await expect(basicInfoPage.lastNameInput).toHaveValue(initialLastName);
    await basicInfoPage.dismissSaveSuccessDialog();
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("EA Change Role", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("EA can change role for advisor user", async ({browser}) => {
    qase.id(2206);
    await assertCanChangeRole(browser, "ea");
  });
});
