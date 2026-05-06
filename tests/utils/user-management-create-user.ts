import {expect} from "@playwright/test";

import {AUTH_STORAGE_STATE, type AuthRole} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {getFormattedDateMMDDYYYY} from "@/utils/math";

const COMPANY_NAME = "Automation Playwright";
const LAST_NAME = "Regre";
const PHONE_NUMBER = "3478481393";

type CreateUserRole = Extract<AuthRole, "pm" | "zpo" | "ea">;

export type CreateUserRoleConfig = {
  roleName: string;
  emailSuffixes: Partial<Record<CreateUserRole, string>>;
  requiresCompany?: boolean;
};

function createUserEmail(
  role: CreateUserRole,
  emailSuffixes: Partial<Record<CreateUserRole, string>>,
) {
  const dateStamp = getFormattedDateMMDDYYYY();
  const runSuffix = emailSuffixes[role] ?? "";
  const timestampSuffix = Date.now().toString().slice(-6);
  return `zoe.qautomation+${dateStamp}${runSuffix}${timestampSuffix}@gmail.com`;
}

function createUserFirstName(roleName: string, role: CreateUserRole) {
  return `${roleName} ${role.toUpperCase()}`;
}

export async function assertCanCreateUserWithRole(
  browser: import("@playwright/test").Browser,
  role: CreateUserRole,
  config: CreateUserRoleConfig,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE[role],
  });
  const page = await context.newPage();

  try {
    const dashboardBase = requireDashboardBaseUrl();
    const usersPage = new UsersManagementPage(page, dashboardBase);
    const addUserPage = new AddUserPage(page);
    const basicInfoPage = new BasicInfoPage(page);
    const email = createUserEmail(role, config.emailSuffixes);
    const firstName = createUserFirstName(config.roleName, role);

    await usersPage.goto();
    await usersPage.openAddNewUser();
    await addUserPage.waitUntilLoaded(config.roleName);

    const userDetails = {
      firstName,
      lastName: LAST_NAME,
      email,
      phoneNumber: PHONE_NUMBER,
      role: config.roleName,
      ...(config.requiresCompany === false ? {} : {company: COMPANY_NAME}),
    };

    await addUserPage.fillUserDetails(userDetails);
    await addUserPage.submit();
    await addUserPage.waitForCreateResult();

    if (/\/basic-info$/i.test(page.url())) {
      await basicInfoPage.waitUntilLoaded();
      await expect(basicInfoPage.firstNameInput).toHaveValue(firstName);
      await expect(basicInfoPage.lastNameInput).toHaveValue(LAST_NAME);
      await expect(basicInfoPage.phoneNumberInput).toHaveValue(
        new RegExp("347"),
      );
      await expect(await basicInfoPage.getSelectedRole()).toBe(config.roleName);
    }

    await usersPage.goto();
    await usersPage.searchInput.fill(email);
    await usersPage.waitForTableRows();

    const createdUserRow = usersPage.getRowByText(email).first();
    await expect(createdUserRow).toBeVisible({timeout: 20_000});

    const rowTexts = await usersPage.getRowCellTexts(createdUserRow);
    await expect(rowTexts.join(" ")).toContain(firstName);
    await expect(rowTexts.join(" ")).toContain(LAST_NAME);
    await expect(rowTexts.join(" ")).toContain(config.roleName);
    if (config.requiresCompany !== false) {
      await expect(rowTexts.join(" ")).toContain(COMPANY_NAME);
    }
  } finally {
    await context.close().catch(() => {});
  }
}
