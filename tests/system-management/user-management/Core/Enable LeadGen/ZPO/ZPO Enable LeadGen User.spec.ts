import {expect, test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {AUTH_STORAGE_STATE} from "@/commons/auth";
import {requireDashboardBaseUrl} from "@/commons/env";
import {AddUserPage} from "@/pages/system-management/user-management/AddUserPage";
import {BasicInfoPage} from "@/pages/system-management/user-management/BasicInfoPage";
import {LeadGenPage} from "@/pages/system-management/user-management/LeadGenPage";
import {UsersManagementPage} from "@/pages/system-management/user-management/UsersManagementPage";
import {getRandomUsLocation} from "@/utils/location";
import {getFormattedDateMMDDYYYY} from "@/utils/math";

const COMPANY_NAME = "Automation Playwright";
const LAST_NAME = "Regre";
const PHONE_NUMBER = "3478481393";

function createLeadGenEmail() {
  const dateStamp = getFormattedDateMMDDYYYY();
  const timestampSuffix = Date.now().toString().slice(-6);
  const roleSuffix = "04";
  return `zoe.qautomation+${dateStamp}${roleSuffix}${timestampSuffix}@gmail.com`;
}

function createFirstName() {
  return `Advisor as Rep ZPO`;
}

function createLeadGenProfileDetails() {
  const location = getRandomUsLocation();

  return {
    zipCode: location.zipCode,
  };
}

async function createAdvisorAsRepUserAndOpenBasicInfo(
  browser: import("@playwright/test").Browser,
) {
  const context = await browser.newContext({
    storageState: AUTH_STORAGE_STATE.zpo,
  });
  const page = await context.newPage();

  const dashboardBase = requireDashboardBaseUrl();
  const usersPage = new UsersManagementPage(page, dashboardBase);
  const addUserPage = new AddUserPage(page);
  const basicInfoPage = new BasicInfoPage(page);
  const email = createLeadGenEmail();
  const firstName = createFirstName();

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

  if (!/\/basic-info$/i.test(page.url())) {
    await usersPage.goto();
    await usersPage.openUserBySearch(email);
  }

  await basicInfoPage.waitUntilLoaded();
  await expect(basicInfoPage.firstNameInput).toHaveValue(firstName);
  await expect(basicInfoPage.lastNameInput).toHaveValue(LAST_NAME);

  return {context, page, email, firstName};
}

async function assertCanEnableLeadGenUser(
  browser: import("@playwright/test").Browser,
) {
  const {context, page, email} = await createAdvisorAsRepUserAndOpenBasicInfo(
    browser,
  );
  const leadGenPage = new LeadGenPage(page);
  const usersPage = new UsersManagementPage(page, requireDashboardBaseUrl());
  const leadGenProfile = createLeadGenProfileDetails();

  try {
    await leadGenPage.open();
    await leadGenPage.expectDisabledState();
    await leadGenPage.addLeadGenUser();
    await leadGenPage.fillLeadGenProfile(leadGenProfile);
    await leadGenPage.saveLeadGenProfile();

    await usersPage.goto();
    await usersPage.openUserBySearch(email);
    await leadGenPage.open();
    await leadGenPage.expectEnabledState();
  } finally {
    await context.close().catch(() => {});
  }
}

test.describe("ZPO Enable LeadGen User", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(180_000);

  test("As ZPO Enable leadgen user", async ({browser}) => {
    qase.id(2165);
    await assertCanEnableLeadGenUser(browser);
  });
});
