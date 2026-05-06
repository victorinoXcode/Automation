import {type Page} from "@playwright/test";

import {type AuthRole} from "@/commons/auth";
import {env, requireDashboardBaseUrl} from "@/commons/env";
import {USERS_MANAGEMENT_PATH} from "@/pages/system-management/user-management/UsersManagementPage";

type RoleCredentials = {
  email: string | undefined;
  password: string | undefined;
};

export const roleCredentials: Record<AuthRole, RoleCredentials> = {
  zpo: {
    email: env.ZPO_EMAIL,
    password: env.ZPO_PASSWORD,
  },
  client: {
    email: env.LOGIN_CLIENT_EMAIL ?? process.env.CLIENT_EMAIL,
    password: env.LOGIN_CLIENT_PASSWORD ?? process.env.CLIENT_PASSWORD,
  },
  advisor: {
    email: env.ADVISOR_EMAIL,
    password: env.ADVISOR_PASSWORD,
  },
  ea: {
    email: env.EA_EMAIL,
    password: env.EA_PASSWORD,
  },
  pm: {
    email: env.PM_EMAIL,
    password: env.PM_PASSWORD,
  },
};

export function getRoleCredentials(role: AuthRole): RoleCredentials {
  return roleCredentials[role];
}

export async function loginToDashboardAsRole(page: Page, role: AuthRole) {
  const credentials = getRoleCredentials(role);
  if (!credentials.email || !credentials.password) {
    throw new Error(`Missing credentials for role "${role}"`);
  }

  const baseUrl = requireDashboardBaseUrl().replace(/\/$/, "");

  try {
    await page.goto(baseUrl, {waitUntil: "networkidle", timeout: 60_000});
  } catch (error) {
    const finalUrl = page.url();
    throw new Error(
      `Failed to navigate to ${baseUrl} during login for role "${role}". Final URL: ${finalUrl}. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    await page.locator("#username").waitFor({state: "visible", timeout: 30_000});
  } catch (error) {
    const finalUrl = page.url();
    const pageTitle = await page.title().catch(() => "N/A");
    throw new Error(
      `Username field not found for role "${role}". Final URL: ${finalUrl}, Page title: ${pageTitle}. Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  await page.locator("#username").fill(credentials.email);
  await page.getByRole("button", {name: "Continue"}).click();
  await page.locator("#password").waitFor({state: "visible", timeout: 60_000});
  await page.locator("#password").fill(credentials.password);
  await page.getByRole("button", {name: "Continue"}).click();

  const loggedInShell = page
    .getByRole("menuitem", {name: "Dashboard"})
    .or(page.getByRole("textbox", {name: "Search..."}));

  await Promise.race([
    page.waitForURL(/\/(dashboard|redirect)(\/|$)/, {
      timeout: 90_000,
      waitUntil: "domcontentloaded",
    }),
    loggedInShell.waitFor({state: "visible", timeout: 90_000}),
  ]);

  const pathAfterLogin = new URL(page.url()).pathname;
  if (pathAfterLogin === "/redirect" || pathAfterLogin.startsWith("/redirect/")) {
    await page.goto(`${baseUrl}${USERS_MANAGEMENT_PATH}`, {
      waitUntil: "domcontentloaded",
    });
    const pathAfterGoto = new URL(page.url()).pathname;
    if (pathAfterGoto.includes("/login")) {
      throw new Error(
        "Login did not establish a session; opened login after navigating to Users Management.",
      );
    }
  }

  await loggedInShell.waitFor({state: "visible", timeout: 90_000});
}
