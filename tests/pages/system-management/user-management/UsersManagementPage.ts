import {expect, type Locator, type Page} from "@playwright/test";

export const USERS_MANAGEMENT_PATH = "/dashboard/management/users";
const FILTER_INPUT_DEBOUNCE_MS = 500;

const COLUMN_IDS = {
  "User Name": "full_name",
  Role: "role",
  Email: "email",
  Phone: "mobile",
  Company: "company.name",
  Status: "is_active",
} as const;

const SET_FILTER_COLUMNS = new Set<UserManagementColumnName>(["Role", "Status"]);

export type UserManagementColumnName = keyof typeof COLUMN_IDS;

/**
 * Page Object for the Users Management list (AG-Grid table).
 * Allows navigating to the page and selecting a random user row to open user detail.
 */
export class UsersManagementPage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string,
  ) {}

  /** Navigate to the Users Management URL. */
  async goto() {
    await this.page.goto(`${this.baseUrl}${USERS_MANAGEMENT_PATH}`, {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForURL(
      new RegExp(`${USERS_MANAGEMENT_PATH.replace(/\//g, "\\/")}$`),
      {timeout: 15_000},
    );
    await expect(this.searchInput).toBeVisible({timeout: 15_000});
  }

  async waitForTableRows() {
    await expect
      .poll(() => this.tableDataRows.count(), {
        timeout: 30_000,
        message: "Users table did not render any data rows",
      })
      .toBeGreaterThan(0);
  }

  /** Data rows of the users table (AG-Grid body rows, excludes header). */
  get tableDataRows(): Locator {
    return this.page.locator(".ag-center-cols-container .ag-row");
  }

  get searchInput(): Locator {
    return this.page.getByRole("textbox", {name: "Search..."});
  }

  get clearFiltersButton(): Locator {
    return this.page.getByRole("button", {name: /clear filters/i});
  }

  get addNewUserLink(): Locator {
    return this.page.getByRole("link", {name: /add new user/i});
  }

  get filterValueInput(): Locator {
    return this.page.getByRole("textbox", {name: "Filter Value"});
  }

  get setFilterSearchInput(): Locator {
    return this.page.getByRole("textbox", {name: "Search filter values"});
  }

  getColumnHeader(name: string): Locator {
    return this.page.getByRole("columnheader", {name, exact: true});
  }

  getHeaderCell(name: UserManagementColumnName): Locator {
    return this.page.locator(`.ag-header-cell[col-id="${COLUMN_IDS[name]}"]`);
  }

  /**
   * Clicks the first available user row to keep the test deterministic.
   * Waits for navigation to the user detail URL.
   */
  async clickFirstUserRow() {
    const rows = this.tableDataRows;
    await expect(rows.first()).toBeVisible({timeout: 30_000});

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error("Users table has no data rows");
    }

    let targetRow: Locator | null = null;
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const cellTexts = await row
        .locator(".ag-cell")
        .allTextContents()
        .then((texts) => texts.map((text) => text.trim()).filter(Boolean));

      if (cellTexts.length > 0) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      throw new Error("Users table rows are rendered but contain no data");
    }

    await this.openRow(targetRow);
  }

  getRowByText(text: string): Locator {
    return this.tableDataRows.filter({hasText: text});
  }

  async getRowCellTexts(row: Locator) {
    return row
      .locator(".ag-cell")
      .allTextContents()
      .then((texts) => texts.map((text) => text.trim()));
  }

  async getVisibleRowsCellTexts() {
    const rowCount = await this.tableDataRows.count();
    const rows: string[][] = [];

    for (let index = 0; index < rowCount; index += 1) {
      rows.push(await this.getRowCellTexts(this.tableDataRows.nth(index)));
    }

    return rows;
  }

  async getFirstRowWithValues(columnIndexes: number[]) {
    const rowCount = await this.tableDataRows.count();

    for (let index = 0; index < rowCount; index += 1) {
      const row = this.tableDataRows.nth(index);
      const cellTexts = await this.getRowCellTexts(row);
      const hasAllValues = columnIndexes.every((columnIndex) =>
        Boolean(cellTexts[columnIndex]?.trim()),
      );

      if (hasAllValues) {
        return {row, cellTexts};
      }
    }

    throw new Error(
      `Could not find a row with values for columns: ${columnIndexes.join(", ")}`,
    );
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
    await expect(this.searchInput).toHaveValue("");
    await this.closeColumnFilter();
    await this.waitForTableRows();
  }

  async openAddNewUser() {
    await this.addNewUserLink.click();
    await this.page.waitForURL(/\/dashboard\/management\/users\/create$/i, {
      timeout: 20_000,
    });
  }

  async closeColumnFilter() {
    await this.page.keyboard.press("Escape");
    await this.filterValueInput.waitFor({state: "hidden", timeout: 1_000}).catch(
      () => {},
    );
  }

  async openColumnFilter(name: UserManagementColumnName) {
    await this.closeColumnFilter();

    const headerCell = this.getHeaderCell(name);
    await expect(headerCell).toBeVisible();

    await headerCell.locator(".ag-header-cell-filter-button").click({force: true});
    await expect(this.filterValueInput).toBeVisible();
  }

  async applyTextColumnFilter(
    name: UserManagementColumnName,
    filterValue: string,
  ) {
    await this.openColumnFilter(name);
    await this.filterValueInput.fill(filterValue);
    await this.page.waitForTimeout(FILTER_INPUT_DEBOUNCE_MS);
    await this.closeColumnFilter();
    await this.waitForTableRows();
  }

  async applySetColumnFilter(name: UserManagementColumnName, filterValue: string) {
    await this.openColumnFilter(name);

    const selectAllCheckbox = this.page.getByRole("checkbox", {
      name: "(Select All)",
      exact: true,
    });
    const targetCheckbox = this.page.getByRole("checkbox", {
      name: filterValue,
      exact: true,
    });

    await expect(targetCheckbox).toBeVisible();

    if (await selectAllCheckbox.isChecked()) {
      await selectAllCheckbox.click();
    }

    if (!(await targetCheckbox.isChecked())) {
      await targetCheckbox.click();
    }

    await this.page.waitForTimeout(FILTER_INPUT_DEBOUNCE_MS);
    await this.closeColumnFilter();
    await this.waitForTableRows();
  }

  async applyColumnFilter(name: UserManagementColumnName, filterValue: string) {
    if (SET_FILTER_COLUMNS.has(name)) {
      await this.applySetColumnFilter(name, filterValue);
      return;
    }

    await this.applyTextColumnFilter(name, filterValue);
  }

  async openUserBySearch(searchTerm: string) {
    await this.searchInput.fill(searchTerm);

    const targetRow = this.getRowByText(searchTerm).first();
    await expect(targetRow).toBeVisible({timeout: 20_000});

    await this.openRow(targetRow);
  }

  async openFirstUserByExactRole(roleName: string) {
    const rows = this.tableDataRows;
    await expect(rows.first()).toBeVisible({timeout: 30_000});

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error("Users table has no data rows");
    }

    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const cellTexts = await this.getRowCellTexts(row);
      const roleText = cellTexts[1];

      if (roleText === roleName) {
        await this.openRow(row);
        return;
      }
    }

    throw new Error(`Could not find a user row with exact role "${roleName}"`);
  }

  async openRow(row: Locator) {
    await row.click();
    await this.page.waitForURL(/\/dashboard\/management\/users\/.+\/basic-info/i, {
      timeout: 20_000,
    });
  }
}
