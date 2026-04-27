import {type Page} from "@playwright/test";

import {env, requireDashboardBaseUrl} from "@/commons/env";
import {LoginPage, type LoginUser} from "@/pages/login/LoginPage";

/**
 * Playwright helpers equivalent to Cypress login commands.
 * Use with page from the test context.
 */

/** Login with credentials and wait for dashboard (like Cypress loginParam). */
export async function loginWithCredentials(
  page: Page,
  baseUrl: string,
  user: LoginUser,
) {
  const loginPage = new LoginPage(page);
  await loginPage.goto(baseUrl);
  await loginPage.loginAsAdmin(user);
  await page.waitForURL(
    (url) => new URL(url).pathname.startsWith("/dashboard"),
    {timeout: 15_000},
  );
}

/** Login as admin using static env credentials – non Plutus (like Cypress loginAdmin). */
export async function loginAsAdminStatic(page: Page) {
  const email = env.ADMIN_EMAIL_NON_PLUTUS;
  const password = env.ADMIN_PASSWORD_NON_PLUTUS;
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL_NON_PLUTUS and ADMIN_PASSWORD_NON_PLUTUS must be set in .env",
    );
  }
  await loginWithCredentials(page, requireDashboardBaseUrl(), {email, password});
}

export async function visitDashboardWithSession(page: Page) {
  await page.goto(requireDashboardBaseUrl());
}

/** Core: viewport, visit /login, click "Login as concierge" (like Cypress pageAdminLogin). */
export async function pageAdminLogin(page: Page) {
  const baseUrl = env.BASE_URL_CORE;
  if (!baseUrl) {
    throw new Error("BASE_URL_CORE must be set in .env for pageAdminLogin");
  }
  const loginPage = new LoginPage(page);
  await loginPage.gotoCoreLoginAsConcierge(baseUrl);
}

/** Forgot password flow (like Cypress forgotPassword). */
export async function forgotPassword(
  page: Page,
  baseUrl: string,
  email: string,
) {
  const loginPage = new LoginPage(page);
  await loginPage.goto(baseUrl);
  await loginPage.forgotPasswordLogin(email);
}
