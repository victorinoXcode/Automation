import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE, type AuthRole} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {getFormattedDateMMDDYYYY} from "@/utils/math";

const COMPANY_NAME = "Automation Playwright";
const LAST_NAME = "Regre";
const PHONE_NUMBER = "3478481393";

const ROLE_EMAIL_SEQUENCE: Record<Extract<AuthRole, "pm" | "zpo" | "ea">, string> = {
  pm: "01",
  zpo: "02",
  ea: "22",
};

function createAdvisorAsRepEmail(role: Extract<AuthRole, "pm" | "zpo" | "ea">) {
  const dateStamp = getFormattedDateMMDDYYYY();
  const runSuffix = ROLE_EMAIL_SEQUENCE[role];
  const timestampSuffix = Date.now().toString().slice(-6);
  return `zoe.qautomation+${dateStamp}${runSuffix}${timestampSuffix}@gmail.com`;
}

function createAdvisorAsRepFirstName(role: Extract<AuthRole, "pm" | "zpo" | "ea">) {
  return `Advisor as Rep ${role.toUpperCase()}`;
}

async function assertCanCreateAdvisorAsRepUser(
  browser: import("@playwright/test").Browser,
  role: Extract<AuthRole, "pm" | "zpo" | "ea">,
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
    const email = createAdvisorAsRepEmail(role);
    const firstName = createAdvisorAsRepFirstName(role);

    await usersPage.goto();
    await usersPage.openAddNewUser();
    await addUserPage.waitUntilLoaded();

    await addUserPage.fillUserDetails({
      firstName,
      lastName: LAST_NAME,
      email,
      phoneNumber: PHONE_NUMBER,
      company: COMPANY_NAME,
    });
    await addUserPage.submit();
    await addUserPage.waitForCreateResult();

    if (/\/basic-info$/i.test(page.url())) {
      await basicInfoPage.waitUntilLoaded();
      await expect(basicInfoPage.firstNameInput).toHaveValue(firstName);
      await expect(basicInfoPage.lastNameInput).toHaveValue(LAST_NAME);
      await expect(basicInfoPage.phoneNumberInput).toHaveValue(
        new RegExp("347"),
      );
      await expect(await basicInfoPage.getSelectedRole()).toBe("Advisor as Rep");
    }

    await usersPage.goto();
    await usersPage.searchInput.fill(email);
    await usersPage.waitForTableRows();

    const createdUserRow = usersPage.getRowByText(email).first();
    await expect(createdUserRow).toBeVisible({timeout: 20_000});

    const rowTexts = await usersPage.getRowCellTexts(createdUserRow);
    await expect(rowTexts.join(" ")).toContain(firstName);
    await expect(rowTexts.join(" ")).toContain(LAST_NAME);
    await expect(rowTexts.join(" ")).toContain("Advisor as Rep");
    await expect(rowTexts.join(" ")).toContain(COMPANY_NAME);
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("User Management Create Advisor as Rep", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Advisor as Rep", async ({browser}) => {
    qase.id(1624);
    await assertCanCreateAdvisorAsRepUser(browser, "pm");
  });

  test("As ZPO Create new user with role Advisor as Rep", async ({browser}) => {
    qase.id(2164);
    await assertCanCreateAdvisorAsRepUser(browser, "zpo");
  });

  test("As EA Create new user with role Advisor as Rep", async ({browser}) => {
    qase.id(2210);
    await assertCanCreateAdvisorAsRepUser(browser, "ea");
  });
});
