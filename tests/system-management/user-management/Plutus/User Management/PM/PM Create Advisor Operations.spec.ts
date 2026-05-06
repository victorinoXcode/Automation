import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Advisor Operations",
  emailSuffixes: {
    pm: "09",
  },
} as const;

test.describe("PM Create Advisor Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Advisor Operations", async ({
    browser,
  }) => {
    qase.id(2170);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });
});
