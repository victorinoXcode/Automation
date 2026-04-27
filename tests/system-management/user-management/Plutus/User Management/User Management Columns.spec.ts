import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";

const EXPECTED_COLUMNS = [
  "User Name",
  "Email",
  "Role",
  "Phone",
  "Company",
  "Status",
] as const;

test("PM can view User Management columns", async ({browser}) => {
  qase.id(1630);

  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE.pm,
  });
  const page = await context.newPage();
  const usersManagementPage = new UsersManagementPage(
    page,
    requireDashboardBaseUrl(),
  );

  try {
    await usersManagementPage.goto();

    for (const columnName of EXPECTED_COLUMNS) {
      await expect(usersManagementPage.getColumnHeader(columnName)).toBeVisible();
    }
  } finally {
    await context.close().catch(() => {});
  }
});
