import {test} from "@playwright/test";
import {qase} from "playwright-qase-reporter";

import {assertCanCreateUserWithRole} from "@/utils/user-management-create-user";

const ROLE_CONFIG = {
  roleName: "Enterprise Operations",
  emailSuffixes: {
    pm: "13",
    zpo: "14",
    ea: "27",
  },
} as const;

test.describe("User Management Create Enterprise Operations", () => {
  test.describe.configure({mode: "serial"});
  test.setTimeout(120_000);

  test("As PM Create new user with role Enterprise Operations", async ({
    browser,
  }) => {
    qase.id(2172);
    await assertCanCreateUserWithRole(browser, "pm", ROLE_CONFIG);
  });

  test("As ZPO Create new user with role Enterprise Operations", async ({
    browser,
  }) => {
    qase.id(2178);
    await assertCanCreateUserWithRole(browser, "zpo", ROLE_CONFIG);
  });

  test("As EA Create new user with role Enterprise Operations", async ({
    browser,
  }) => {
    qase.id(2215);
    await assertCanCreateUserWithRole(browser, "ea", ROLE_CONFIG);
  });
});
