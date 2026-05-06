import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Admin",
  emailSuffixes: {
    pm: "11",
    zpo: "12",
    ea: "28",
  },
} as const;

test.describe("User Management Create Enterprise Admin", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Enterprise Admin", async ({
    browser,
  }) => {
    qase.id(2171);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });

  test("As ZPO Create new user with role Enterprise Admin", async ({
    browser,
  }) => {
    qase.id(2177);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });

  test("As EA Create new user with role Enterprise Admin", async ({
    browser,
  }) => {
    qase.id(2216);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
