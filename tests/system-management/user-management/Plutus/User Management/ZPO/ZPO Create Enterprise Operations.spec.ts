import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Operations",
  emailSuffixes: {
    zpo: "14",
  },
} as const;

test.describe("ZPO Create Enterprise Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As ZPO Create new user with role Enterprise Operations", async ({
    browser,
  }) => {
    qase.id(2178);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
