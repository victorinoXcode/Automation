import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Trader",
  emailSuffixes: {
    pm: "15",
  },
} as const;

test.describe("PM Create Enterprise Trader", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Enterprise Trader", async ({
    browser,
  }) => {
    qase.id(2173);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });
});
