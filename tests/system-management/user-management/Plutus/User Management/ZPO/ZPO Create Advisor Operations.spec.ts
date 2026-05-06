import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Advisor Operations",
  emailSuffixes: {
    zpo: "10",
  },
} as const;

test.describe("ZPO Create Advisor Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As ZPO Create new user with role Advisor Operations", async ({
    browser,
  }) => {
    qase.id(2176);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
