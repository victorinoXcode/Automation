import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Zoe Platform Operations",
  requiresCompany: false,
  emailSuffixes: {
    zpo: "20",
  },
} as const;

test.describe("ZPO Create Zoe Platform Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As ZPO Create new user with role Zoe Platform Operations (ZPO)", async ({
    browser,
  }) => {
    qase.id(2180);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
