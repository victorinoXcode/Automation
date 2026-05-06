import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Zoe Platform Operations",
  requiresCompany: false,
  emailSuffixes: {
    ea: "29",
  },
} as const;

test.describe("EA Create Zoe Platform Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Zoe Platform Operations (ZPO)", async ({
    browser,
  }) => {
    qase.id(2217);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
