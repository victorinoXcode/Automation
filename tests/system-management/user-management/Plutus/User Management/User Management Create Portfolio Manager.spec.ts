import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Portfolio Manager",
  requiresCompany: false,
  emailSuffixes: {
    pm: "17",
    zpo: "18",
  },
} as const;

test.describe("User Management Create Portfolio Manager", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Portfolio Manager (PM)", async ({
    browser,
  }) => {
    qase.id(2175);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });

  test("As ZPO Create new user with role Portfolio Manager (PM)", async ({
    browser,
  }) => {
    qase.id(2181);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });
});
