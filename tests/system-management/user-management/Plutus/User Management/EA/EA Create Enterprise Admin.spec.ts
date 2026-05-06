import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Admin",
  emailSuffixes: {
    ea: "28",
  },
} as const;

test.describe("EA Create Enterprise Admin", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As EA Create new user with role Enterprise Admin", async ({
    browser,
  }) => {
    qase.id(2216);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
