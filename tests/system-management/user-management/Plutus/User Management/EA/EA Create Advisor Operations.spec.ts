import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Advisor Operations",
  requiresCompany: false,
  emailSuffixes: {
    ea: "24",
  },
} as const;

test.describe("EA Create Advisor Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Advisor Operations", async ({
    browser,
  }) => {
    qase.id(2212);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
