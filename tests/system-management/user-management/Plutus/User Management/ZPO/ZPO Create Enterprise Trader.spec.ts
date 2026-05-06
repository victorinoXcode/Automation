import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Trader",
  emailSuffixes: {
    zpo: "16",
  },
} as const;

test.describe("ZPO Create Enterprise Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As ZPO Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2179);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
