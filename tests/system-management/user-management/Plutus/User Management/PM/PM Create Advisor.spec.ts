import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {getFormattedDateMMDDYYYY} from "@/utils/math";

const COMPANY_NAME = "Automation Playwright";
const FIRST_NAME = "Advisor";
const LAST_NAME = "Regre";
const PHONE_NUMBER = "3478481393";
const ROLE_NAME = "Advisor";
const EMAIL_SUFFIX = "05";

function createAdvisorEmail() {
  const dateStamp = getFormattedDateMMDDYYYY();
  const timestampSuffix = Date.now().toString().slice(-6);
  return `zoe.qautomation+${dateStamp}${EMAIL_SUFFIX}${timestampSuffix}@gmail.com`;
}

function createAdvisorFirstName() {
  return `${FIRST_NAME} PM`;
}

async function assertCanCreateAdvisorUser(
  browser: import("@playwright/test").Browser,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE.pm,
  });
  const page = await context.newPage();

  try {
    const dashboardBase = requireDashboardBaseUrl();
    const usersPage = new UsersManagementPage(page, dashboardBase);
    const addUserPage = new AddUserPage(page);
    const basicInfoPage = new BasicInfoPage(page);
    const email = createAdvisorEmail();
    const firstName = createAdvisorFirstName();

    await usersPage.goto();
    await usersPage.openAddNewUser();
    await addUserPage.waitUntilLoaded(ROLE_NAME);

    await addUserPage.fillUserDetails({
      firstName,
      lastName: LAST_NAME,
      email,
      phoneNumber: PHONE_NUMBER,
      company: COMPANY_NAME,
      role: ROLE_NAME,
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
      await expect(await basicInfoPage.getSelectedRole()).toBe(ROLE_NAME);
    }

    await usersPage.goto();
    await usersPage.searchInput.fill(email);
    await usersPage.waitForTableRows();

    const createdUserRow = usersPage.getRowByText(email).first();
    await expect(createdUserRow).toBeVisible({timeout: 20_000});

    const rowTexts = await usersPage.getRowCellTexts(createdUserRow);
    await expect(rowTexts.join(" ")).toContain(firstName);
    await expect(rowTexts.join(" ")).toContain(LAST_NAME);
    await expect(rowTexts.join(" ")).toContain(ROLE_NAME);
    await expect(rowTexts.join(" ")).toContain(COMPANY_NAME);
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("PM Create Advisor", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Advisor", async ({browser}) => {
    qase.id(2166);
    await assertCanCreateAdvisorUser(browser);
  });
});
