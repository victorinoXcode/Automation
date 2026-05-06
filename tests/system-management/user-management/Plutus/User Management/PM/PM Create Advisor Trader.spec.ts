import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Advisor Trader",
  emailSuffixes: {
    pm: "07",
  },
} as const;

test.describe("PM Create Advisor Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Advisor Trader", async ({
    browser,
  }) => {
    qase.id(2168);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });
});
