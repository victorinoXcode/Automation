import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Portfolio Manager",
  requiresCompany: false,
  emailSuffixes: {
    pm: "17",
  },
} as const;

test.describe("PM Create Portfolio Manager", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Portfolio Manager (PM)", async ({
    browser,
  }) => {
    qase.id(2175);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });
});
