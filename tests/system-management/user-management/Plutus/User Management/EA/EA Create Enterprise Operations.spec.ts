import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Operations",
  requiresCompany: false,
  emailSuffixes: {
    ea: "27",
  },
} as const;

test.describe("EA Create Enterprise Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Enterprise Operations", async ({
    browser,
  }) => {
    qase.id(2215);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
