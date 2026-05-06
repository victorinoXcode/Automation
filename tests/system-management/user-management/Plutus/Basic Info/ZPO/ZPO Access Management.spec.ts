import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

const TARGET_USER_SEARCH = "zoe.qautomation+advisor@gmail.com";

async function openTargetUser(
  browser: import("@playwright/test").Browser,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE.zpo,
  });
  const page = await context.newPage();
  const usersPage = new UsersManagementPage(page, requireDashboardBaseUrl());
  const basicInfoPage = new BasicInfoPage(page);

  await usersPage.goto();
  await usersPage.openUserBySearch(TARGET_USER_SEARCH);
  await basicInfoPage.waitUntilLoaded();

  return {context, page, basicInfoPage};
}

async function ensureAccessEnabled(basicInfoPage: BasicInfoPage) {
  if (await basicInfoPage.isAccessRemoved()) {
    await basicInfoPage.restoreAccess();
  }
}

async function assertCanRemoveAccess(
  browser: import("@playwright/test").Browser,
) {
  const {context, basicInfoPage} = await openTargetUser(browser);

  try {
    await ensureAccessEnabled(basicInfoPage);
    await basicInfoPage.removeAccess();

    await expect(basicInfoPage.restoreAccessButton).toBeVisible();
    await expect(basicInfoPage.firstNameInput).toBeDisabled();
    await expect(basicInfoPage.lastNameInput).toBeDisabled();
    await expect(basicInfoPage.phoneNumberInput).toBeDisabled();
  } finally {
    if (await basicInfoPage.isAccessRemoved().catch(() => false)) {
      await basicInfoPage.restoreAccess().catch(() => {});
    }
    await context.close().catch(() => {});
  }
}

async function assertCanRestoreAccess(
  browser: import("@playwright/test").Browser,
) {
  const {context, basicInfoPage} = await openTargetUser(browser);

  try {
    await ensureAccessEnabled(basicInfoPage);
    await basicInfoPage.removeAccess();
    await basicInfoPage.restoreAccess();

    await expect(basicInfoPage.removeAccessButton).toBeVisible();
    await expect(basicInfoPage.firstNameInput).toBeEditable();
    await expect(basicInfoPage.lastNameInput).toBeEditable();
    await expect(basicInfoPage.phoneNumberInput).toBeEditable();
  } finally {
    if (await basicInfoPage.isAccessRemoved().catch(() => false)) {
      await basicInfoPage.restoreAccess().catch(() => {});
    }
    await context.close().catch(() => {});
  }
}

test.describe("ZPO Access Management", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("ZPO can remove user access", async ({browser}) => {
    qase.id(2116);
    await assertCanRemoveAccess(browser);
  });

  test("ZPO can restore user access", async ({browser}) => {
    qase.id(2117);
    await assertCanRestoreAccess(browser);
  });
});
