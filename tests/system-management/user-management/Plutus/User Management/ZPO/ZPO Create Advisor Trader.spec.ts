import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Advisor Trader",
  emailSuffixes: {
    zpo: "08",
  },
} as const;

test.describe("ZPO Create Advisor Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As ZPO Create new user with role Advisor Trader", async ({
    browser,
  }) => {
    qase.id(2169);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
