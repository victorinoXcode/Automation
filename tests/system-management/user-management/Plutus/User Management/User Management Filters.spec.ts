import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {
  type UserManagementColumnName,
  UsersManagementPage,
} from "@/pages/system-management/user-management/UsersManagementPage";

const FILTERABLE_COLUMNS = [
  "User Name",
  "Role",
  "Email",
  "Phone",
  "Company",
  "Status",
] as const satisfies readonly UserManagementColumnName[];

const COLUMN_INDEX: Record<UserManagementColumnName, number> = {
  "User Name": 0,
  Role: 1,
  Email: 2,
  Phone: 3,
  Company: 4,
  Status: 5,
};

function getFilterValue(columnName: UserManagementColumnName, cellValue: string) {
  if (columnName === "Phone") {
    const digitsOnly = cellValue.replace(/\D/g, "");
    return digitsOnly.slice(-4);
  }

  return cellValue;
}

function getRequiredCellValue(cellTexts: string[], columnName: UserManagementColumnName) {
  const cellValue = cellTexts[COLUMN_INDEX[columnName]];

  if (cellValue === undefined) {
    throw new Error(`Missing cell value for column "${columnName}"`);
  }

  return cellValue;
}

async function expectVisibleRowsToContainTextInAnyColumn(
  usersManagementPage: UsersManagementPage,
  expectedText: string,
) {
  const normalizedExpectedText = expectedText.toLowerCase();

  await expect
    .poll(async () => {
      const rows = await usersManagementPage.getVisibleRowsCellTexts();
      return rows.every((row) =>
        row.join(" ").toLowerCase().includes(normalizedExpectedText),
      );
    })
    .toBe(true);
}

async function expectVisibleRowsToContainTextInColumn(
  usersManagementPage: UsersManagementPage,
  columnName: UserManagementColumnName,
  expectedText: string,
) {
  const normalizedExpectedText = expectedText.toLowerCase();
  const columnIndex = COLUMN_INDEX[columnName];

  await expect
    .poll(async () => {
      const rows = await usersManagementPage.getVisibleRowsCellTexts();
      return rows.every((row) =>
        (row[columnIndex] ?? "").toLowerCase().includes(normalizedExpectedText),
      );
    })
    .toBe(true);
}

test("PM can filter User Management table with all available filters", async ({
  browser,
}) => {
  qase.id(1631);

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
    await usersManagementPage.waitForTableRows();

    const {cellTexts} = await usersManagementPage.getFirstRowWithValues(
      FILTERABLE_COLUMNS.map((columnName) => COLUMN_INDEX[columnName]),
    );

    const searchTerm = getRequiredCellValue(cellTexts, "Email");
    await usersManagementPage.searchInput.fill(searchTerm);
    await usersManagementPage.waitForTableRows();
    await expectVisibleRowsToContainTextInAnyColumn(usersManagementPage, searchTerm);

    await usersManagementPage.clearFilters();

    for (const columnName of FILTERABLE_COLUMNS) {
      const filterValue = getFilterValue(
        columnName,
        getRequiredCellValue(cellTexts, columnName),
      );

      await usersManagementPage.applyColumnFilter(columnName, filterValue);
      await expectVisibleRowsToContainTextInColumn(
        usersManagementPage,
        columnName,
        filterValue,
      );

      await usersManagementPage.clearFilters();
    }
  } finally {
    await context.close().catch(() => {});
  }
});
