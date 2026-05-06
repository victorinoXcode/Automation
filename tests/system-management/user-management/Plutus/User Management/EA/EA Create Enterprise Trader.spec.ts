import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Trader",
  emailSuffixes: {
    ea: "26",
  },
} as const;

test.describe("EA Create Enterprise Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2214);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
