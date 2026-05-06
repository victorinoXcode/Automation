import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

const ROLES_MATRIX_SPREADSHEET_ID =
  "1UCXwc5FOAsoYdw2lr-yxwSxcpKBrJFhQ_0XQ5r6xDjs";
const ROLES_MATRIX_GID = "1214946580";

async function runLearnMoreRoleOpensRolesMatrix(
  page: import("@playwright/test").Page,
  context: import("@playwright/test").BrowserContext,
) {
  const dashboardBase = requireDashboardBaseUrl();
  const usersPage = new UsersManagementPage(page, dashboardBase);
  await usersPage.goto();
  await expect(page).toHaveURL(
    `${dashboardBase}/dashboard/management/users`,
  );

  await usersPage.clickFirstUserRow();

  const basicInfoPage = new BasicInfoPage(page);
  await basicInfoPage.waitUntilLoaded();
  await expect(basicInfoPage.learnMoreRoleLink).toBeVisible({timeout: 15_000});

  const popupPromise = context
    .waitForEvent("page", {timeout: 10_000})
    .catch(() => null);
  await basicInfoPage.clickLearnMoreRole();

  const popup = await popupPromise;
  const destinationPage = popup ?? page;
  await expect(destinationPage).toHaveURL(
    new RegExp(
      `(docs\\.google\\.com/spreadsheets/d/${ROLES_MATRIX_SPREADSHEET_ID}|accounts\\.google\\.com.*${ROLES_MATRIX_SPREADSHEET_ID}).*gid=${ROLES_MATRIX_GID}`,
    ),
    {timeout: 20_000},
  );

  if (popup) {
    await popup.close();
  }
}

async function assertRoleFlow(
  browser: import("@playwright/test").Browser,
) {
  const context = await browser.newContext({storageState: AUTH_STORAGE_STATE.zpo});
  const page = await context.newPage();

  try {
    const dashboardBase = requireDashboardBaseUrl();
    await page.goto(dashboardBase);
    await expect(page).toHaveURL(
      new RegExp(`${dashboardBase}/dashboard`),
    );
    await runLearnMoreRoleOpensRolesMatrix(page, context);
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("ZPO Learn More Button", () => {
  test("ZPO Learn More Button", async ({browser}) => {
    qase.id(2098);
    await assertRoleFlow(browser);
  });
});
