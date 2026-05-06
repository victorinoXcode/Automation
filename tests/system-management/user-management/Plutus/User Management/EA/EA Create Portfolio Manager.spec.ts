import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Portfolio Manager",
  requiresCompany: false,
  emailSuffixes: {
    ea: "25",
  },
} as const;

test.describe("EA Create Portfolio Manager", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Portfolio Manager (PM)", async ({
    browser,
  }) => {
    qase.id(2213);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
