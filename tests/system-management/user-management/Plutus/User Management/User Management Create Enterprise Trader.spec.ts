import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Trader",
  emailSuffixes: {
    pm: "15",
    zpo: "16",
    ea: "26",
  },
} as const;

test.describe("User Management Create Enterprise Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2173);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });

  test("As ZPO Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2179);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });

  test("As EA Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2214);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
